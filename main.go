package main

import (
	"context"
	"crypto/tls"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gin-contrib/sessions"
	gormsessions "github.com/gin-contrib/sessions/gorm"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/pkoukk/tiktoken-go"
	"github.com/robfig/cron/v3"
	openai "github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
	glogger "gorm.io/gorm/logger"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

//go:embed templates
var FS embed.FS

var (
	logger = log.Default()
	db     *gorm.DB
	qqData Message
)

type OpenAI struct {
	client *openai.Client
}

func ChatGpt(authToken string) OpenAI {
	config := openai.DefaultConfig(authToken)

	if openaiApi != "" {
		config.BaseURL = openaiApi
	}

	if httpProxy != "" {
		proxyUrl, _ := url.Parse(httpProxy)

		config.HTTPClient = &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
				Proxy:           http.ProxyURL(proxyUrl),
			},
		}

	}

	return OpenAI{client: openai.NewClientWithConfig(config)}
}

func (ai OpenAI) Conv(message string) {
	resp, err := ai.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: model,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: qsystemPrompt,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: webSearch(message),
				},
			},
			Temperature:      0.7,
			TopP:             1.0,
			PresencePenalty:  1.0,
			FrequencyPenalty: 0,
		},
	)

	if err != nil {
		logger.Println(err)
		return
	}

	SendQQMsg(resp.Choices[0].Message.Content)
}

func (ai OpenAI) ConvStream(ctx context.Context, ch chan<- string, messages []openai.ChatCompletionMessage, model string) error {
	checkTokens(&messages, model)

	messages = append([]openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleSystem,
			Content: systemPrompt,
		},
	}, messages...)

	req := openai.ChatCompletionRequest{
		Model:            model,
		Messages:         messages,
		Temperature:      0.7,
		TopP:             1.0,
		PresencePenalty:  1.0,
		FrequencyPenalty: 0,
		Stream:           true,
	}

	stream, err := ai.client.CreateChatCompletionStream(ctx, req)
	if err != nil {
		logger.Println(err)
		return err
	}

	defer stream.Close()

	for {
		response, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			return nil
		}

		if err != nil && !errors.Is(err, context.Canceled) {
			logger.Println(err)
			return err
		}

		if len(response.Choices) == 0 {
			return errors.New("请求出错！")
		}

		select {
		case <-ctx.Done():
			return nil
		default:
			ch <- response.Choices[0].Delta.Content
		}
	}
}

func (ai OpenAI) Image(prompt string) {
	ctx := context.Background()

	req := openai.ImageRequest{
		Prompt:         prompt,
		Size:           openai.CreateImageSize256x256,
		ResponseFormat: openai.CreateImageResponseFormatB64JSON,
		N:              1,
	}

	resp, err := ai.client.CreateImage(ctx, req)
	if err != nil {
		fmt.Printf("Image creation error: %v\n", err)
		return
	}

	SendQQImage(fmt.Sprintf("base64://%s", resp.Data[0].B64JSON))
}

func GeminiChatComplete(ctx context.Context, ch chan<- string, messages []openai.ChatCompletionMessage, modelName string) error {
	var content string
	var chatHistory []*genai.Content

	for i, v := range messages {
		if i == len(messages)-1 {
			content = v.Content
		} else {
			var chat *genai.Content
			role := v.Role

			if v.Role == "assistant" {
				role = "model"
			}

			chat = &genai.Content{
				Parts: []genai.Part{
					genai.Text(v.Content),
				},
				Role: role,
			}

			chatHistory = append(chatHistory, chat)
		}
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(geminiApiKey), option.WithEndpoint(geminiApi))
	if err != nil {
		return err
	}

	defer client.Close()

	model := client.GenerativeModel(modelName)
	cs := model.StartChat()
	cs.History = chatHistory

	iter := cs.SendMessageStream(ctx, genai.Text(content))
	for {
		resp, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return err
		}

		select {
		case <-ctx.Done():
			return nil
		default:
			ch <- fmt.Sprintf("%s", resp.Candidates[0].Content.Parts[0])
		}
	}

	return nil
}

func checkTokens(messages *[]openai.ChatCompletionMessage, model string) {
	// https://github.com/pkoukk/tiktoken-go

	tkm, err := tiktoken.EncodingForModel(model)
	if err != nil {
		err = fmt.Errorf("EncodingForModel: %v", err)
		fmt.Println(err)
		return
	}

	var tokensPerMessage, tokensPerName int
	switch model {
	case "gpt-3.5-turbo-0613",
		"gpt-3.5-turbo-16k-0613",
		"gpt-4-0314",
		"gpt-4-32k-0314",
		"gpt-4-0613",
		"gpt-4-32k-0613":
		tokensPerMessage = 3
		tokensPerName = 1
	case "gpt-3.5-turbo-0301":
		tokensPerMessage = 4
		tokensPerName = -1
	default:
		if strings.Contains(model, "gpt-3.5-turbo") {
			checkTokens(messages, "gpt-3.5-turbo-0613")
		} else if strings.Contains(model, "gpt-4") {
			checkTokens(messages, "gpt-4-0613")
		} else {
			log.Println("checkTokens: model not found. Using cl100k_base encoding.")
			return
		}
	}

	var n int
	for _, message := range *messages {
		n += tokensPerMessage
		n += len(tkm.Encode(message.Content, nil, nil))
		n += len(tkm.Encode(message.Role, nil, nil))
		n += len(tkm.Encode(message.Name, nil, nil))
		if message.Name != "" {
			n += tokensPerName
		}
	}

	n += 3 // every reply is primed with <|start|>assistant<|message|>

	if n > maxTokens && len(*messages) > 2 {
		*messages = (*messages)[2:]
		checkTokens(messages, model)
	}
}

func webSearch(query string) string {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.PostForm(webSearchApi, url.Values{"query": {query}})
	if err != nil {
		logger.Println(err)
		return query
	}

	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode == 200 {
		return string(body)
	}

	return query
}

func auth(c *gin.Context) (User, error) {
	session := sessions.Default(c)
	user := session.Get("user")

	if user != nil {
		var u User
		db.Select("id, name, username, disabled, role, gpt3, gpt4, m, created_at").First(&u, "username = ?", user)

		if u.Disabled {
			return User{}, fmt.Errorf("账号已禁用")
		}

		return u, nil
	}

	return User{}, fmt.Errorf("请先登录")
}

func zaob() {
	var data struct {
		Code     int    `json:"code"`
		Msg      string `json:"msg"`
		ImageUrl string `json:"imageUrl"`
		DataTime string `json:"datatime"`
	}

	resp, err := http.Get(zaobApi)
	if err != nil {
		log.Println(err)
		return
	}

	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	json.Unmarshal(body, &data)

	qqData.MessageType = "group"
	SendQQImage(data.ImageUrl)
}

func init() {
	if strings.Contains(os.Args[0], "go-build") {
		gin.SetMode(gin.DebugMode)
	} else {
		logFile, _ := os.OpenFile("ai.log", os.O_CREATE|os.O_APPEND|os.O_RDWR, 0644)
		logger = log.New(logFile, "[AI] ", log.Lshortfile|log.LstdFlags)
		gin.DefaultWriter = io.MultiWriter(logFile, os.Stdout)
		gin.SetMode(gin.ReleaseMode)
	}
}

func main() {
	initConfig()

	c := cron.New()
	c.AddFunc("0 9 * * *", zaob)
	c.Start()

	chatgpt := ChatGpt(openAiApiKey)

	var err error
	db, err = gorm.Open(sqlite.Open("data.db"), &gorm.Config{
		Logger: glogger.New(logger, glogger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  glogger.Error,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		}),
	})
	if err != nil {
		panic(err)
	}

	db.AutoMigrate(&User{})
	store := gormsessions.NewStore(db, true, []byte(secretKey))

	r := gin.Default()
	r.Use(sessions.Sessions("user_session", store))

	templ := template.Must(template.New("").ParseFS(FS, "templates/*.*"))
	r.SetHTMLTemplate(templ)

	f, _ := fs.Sub(FS, "templates/static")
	r.StaticFS("/static", http.FS(f))

	r.NoRoute(func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{"title": title})
	})

	r.POST("/qai", func(c *gin.Context) {
		c.ShouldBindJSON(&qqData)

		re := regexp.MustCompile(`^\[[^\[\]]+\]\s*`)
		msg := re.ReplaceAllString(qqData.RawMessage, "")

		re1 := regexp.MustCompile(`^(图|图片|tu|image)`)

		if re1.MatchString(msg) {
			go chatgpt.Image(re1.ReplaceAllString(msg, ""))
		} else {
			go chatgpt.Conv(msg)
		}

		c.JSON(http.StatusOK, gin.H{})
	})

	r.POST("/ai", func(c *gin.Context) {
		cu, err := auth(c)

		if err != nil {
			c.JSON(401, gin.H{"message": err.Error()})
			return
		}

		if (cu.Role == "guest" && (cu.Gpt3 > maxGpt3 || cu.Gpt4 > maxGpt4)) || (cu.Role == "user" && cu.Gpt4 > maxGpt4) {
			c.JSON(500, gin.H{"message": "会话已达到限制"})
			return
		}

		var d struct {
			Messages []openai.ChatCompletionMessage `json:"messages"`
			Model    string
		}
		c.ShouldBindJSON(&d)

		if d.Model == "gpt-4" {
			chatgpt = ChatGpt(openAiApiKeyGpt4)
		}

		ch := make(chan string)
		ctx := c.Request.Context()

		go func() {
			defer close(ch)

			var err error

			if strings.Contains(d.Model, "gemini") {
				err = GeminiChatComplete(ctx, ch, d.Messages, d.Model)
			} else {
				err = chatgpt.ConvStream(ctx, ch, d.Messages, d.Model)
			}

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			cu.Count(d.Model)
		}()

		c.Writer.Header().Set("Content-Type", "text/event-stream")

		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				c.Writer.WriteString(msg)
				c.Writer.Flush()
			}
		}
	})

	r.POST("/login", func(c *gin.Context) {
		var u User
		c.ShouldBindJSON(&u)

		err := u.Login()
		if err != nil {
			c.JSON(401, gin.H{"message": err.Error()})
			return
		}

		session := sessions.Default(c)
		session.Set("user", u.Username)
		session.Options(sessions.Options{
			MaxAge: 3600 * 24 * 15,
		})
		session.Save()

		c.JSON(200, gin.H{"message": "登录成功"})
	})

	r.GET("/logout", func(c *gin.Context) {
		session := sessions.Default(c)
		session.Clear()
		session.Save()
		c.JSON(200, gin.H{"message": "登出成功"})
	})

	r.GET("/userinfo", func(c *gin.Context) {
		cu, err := auth(c)

		if err != nil {
			c.JSON(401, gin.H{"message": err.Error()})
			return
		}

		c.JSON(200, cu)
	})

	r.Any("/user", func(c *gin.Context) {
		method := c.Request.Method
		cu, err := auth(c)

		if method != "POST" && err != nil {
			c.JSON(401, gin.H{"message": err.Error()})
			return
		}

		if method != "POST" && cu.Role != "admin" {
			c.JSON(401, gin.H{
				"message": "没有访问权限",
			})
			return
		}

		var u User
		c.ShouldBindJSON(&u)

		switch method {
		case "GET":
			c.JSON(200, u.All())
		case "POST":
			err := u.Create()

			if err != nil {
				c.JSON(500, gin.H{"message": err.Error()})
			} else {
				c.JSON(200, gin.H{"message": "添加成功"})
			}
		case "PUT":
			err := u.Update()

			if err != nil {
				c.JSON(500, gin.H{"message": err.Error()})
			} else {
				c.JSON(200, gin.H{"message": "更新成功"})
			}
		case "DELETE":
			err := u.Delete()

			if err != nil {
				c.JSON(500, gin.H{"message": err.Error()})
			} else {
				c.JSON(200, gin.H{"message": "删除成功"})
			}
		default:
			c.String(405, "Method Not Allowed")
		}

	})

	r.Run("127.0.0.1:5800")
}
