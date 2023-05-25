package main

import (
	"bufio"
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

	"github.com/BurntSushi/toml"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/google/uuid"
	"github.com/pkoukk/tiktoken-go"
	openai "github.com/sashabaranov/go-openai"
)

//https://chat.openai.com/api/auth/session
//authorization: Bearer
//cookie: _puid

//go:embed templates
var FS embed.FS

var (
	configName = "config.toml"

	cqhttpApi    string // cqhttp api
	groupId      string // 发送消息的qq群
	openaiApi    string // openai api
	openAiApiKey string // openai api secret key
	httpProxy    string // openai代理
	model        string // 使用模型
	maxTokens    int    // 限制token数量

	systemPrompt  string
	qsystemPrompt string

	//openai web
	openaiWebApi         = "http://a.tanwen.net:8080"
	openaiWebAccessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiI5ODcxNDY5NzFAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItRUVCbFhHdlZzbm1vT2xza3lOM2E5UVNSIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2M2FhOWYwNjM4YTk3OTk0N2RiNWFjZWUiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjgxMjgwMTUwLCJleHAiOjE2ODI0ODk3NTAsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MifQ.eZr-RxhT9dtCek69ZjeGHpPJuuPBSWrIizPyDfQ2VhcXfNG4s6ggdM1hSGqmI2NdXxHGRXaZ88wiRcB6OeA1HSkJXAcD9q1Unk--H1WZK_8wfqnKwgaEkq8b4hhX3p9lWcOkhGhX99k9RH4zaDCZvHNa29WrUf3QGZoJE8CSyiyYaBYX-dD2FxZsiMb2izIAYOZPKuqojlfwG8yDEEJWDH_z4nkVes8_o49KCbENBqNsy3JBznYY8LIO9HJuk5pOB5lCvoWnM_JQKIuYNWEzeUJuYvoC6BySV64Ki8KbdvAvLwXjzheOPfUq5ZaXpM3uJNQS3N5i2_olyrNxu6FYyA"
)

type Config struct {
	CqhttpApi     string `toml:"cqhttp_api"`
	GroupId       string `toml:"group_id"`
	OpenaiApi     string `toml:"openai_api"`
	OpenAiApiKey  string `toml:"openai_api_key"`
	HttpProxy     string `toml:"http_proxy"`
	Model         string `toml:"model"`
	MaxTokens     int    `toml:"max_tokens"`
	SystemPrompt  string `toml:"system_prompt"`
	QsystemPrompt string `toml:"qsystem_prompt"`
}

type Sender struct {
	UserId   int64  `json:"user_id"` // 发送者 QQ 号
	Nickname string // 昵称
	Sex      string // 性别, male 或 female 或 unknown
	Age      int32  // 年龄
	Card     string // 群名片／备注
	Area     string // 地区
	Level    string // 成员等级
	Role     string // 角色, owner 或 admin 或 member
	Title    string // 专属头衔
}

type Message struct {
	MessageType string `json:"message_type"` // private, group	消息类型
	SubType     string `json:"sub_type"`     // group, public	表示消息的子类型
	MessageId   int32  `json:"message_id"`   //消息 ID
	UserId      int64  `json:"user_id"`      //发送者 QQ 号
	Message     string // 一个消息链
	RawMessage  string `json:"raw_message"` // CQ 码格式的消息
	Font        int    // 0	字体
	Sender      Sender // 发送者信息

}

type WebConvMessage struct {
	Id    string `json:"id"`
	Auhor struct {
		Role string `json:"role"`
	} `json:"author"`
	Content struct {
		ContentType string   `json:"content_type"`
		Parts       []string `json:"parts"`
	} `json:"content"`
	EndTurn bool `json:"end_turn"`
}

type WebMessage struct {
	Action          string           `json:"action"`
	Messages        []WebConvMessage `json:"messages"`
	ConversationId  string           `json:"conversation_id"`
	ParentMessageId string           `json:"parent_message_id"`
	Model           string           `json:"model"`
}

type WebResMessage struct {
	Message        WebConvMessage `json:"message"`
	ConversationId string         `json:"conversation_id"`
}

type OpenAI struct {
	client *openai.Client
}

var (
	Msg             []openai.ChatCompletionMessage
	qqData          Message
	conversationId  = ""
	parentMessageId = ""
)

func ChatGpt() OpenAI {
	config := openai.DefaultConfig(openAiApiKey)

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

	checkTokens(&Msg, model)

	return OpenAI{client: openai.NewClientWithConfig(config)}
}

func (ai OpenAI) Conv(message string) {
	Msg = append(Msg, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: message,
	})

	if Msg[0].Role != openai.ChatMessageRoleSystem {
		Msg = append([]openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: qsystemPrompt,
			},
		}, Msg...)
	}

	resp, err := ai.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:            model,
			Messages:         Msg,
			Temperature:      0.7,
			TopP:             1.0,
			PresencePenalty:  1.0,
			FrequencyPenalty: 0,
		},
	)

	if err != nil {
		log.Println(err)
		return
	}

	Msg = append(Msg, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleAssistant,
		Content: resp.Choices[0].Message.Content,
	})

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
		log.Println(err)
		return err
	}

	defer stream.Close()

	for {
		response, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			return nil
		}

		if err != nil && !errors.Is(err, context.Canceled) {
			log.Println(err)
			return err
		}

		select {
		case <-ctx.Done():
			return nil
		default:
			ch <- response.Choices[0].Delta.Content
		}
	}
}

func (ai OpenAI) ConvStreamWeb(ch chan string, message string, model string) {
	var data WebMessage
	var rdata *WebResMessage

	id := uuid.NewString()
	apiUrl := openaiWebApi

	v, ok := os.LookupEnv("openaiWebApi")
	if ok {
		apiUrl = v
	}

	conv := WebConvMessage{
		Id: id,
		Auhor: struct {
			Role string `json:"role"`
		}{
			Role: "user",
		},
		Content: struct {
			ContentType string   `json:"content_type"`
			Parts       []string `json:"parts"`
		}{
			ContentType: "text",
			Parts:       []string{message},
		},
	}

	data.Action = "next"
	data.Messages = []WebConvMessage{conv}
	data.ConversationId = conversationId
	data.ParentMessageId = parentMessageId
	data.Model = model

	d, _ := json.Marshal(data)

	req := resty.New().SetBaseURL(apiUrl)
	req.SetHeader("Authorization", openaiWebAccessToken)
	resp, _ := req.R().
		SetDoNotParseResponse(true).
		SetHeader("Content-Type", "application/json").
		SetHeader("Accept", "text/event-stream").
		SetBody(d).Post("/conversation")

	defer func(body io.ReadCloser) {
		body.Close()
		close(ch)
	}(resp.RawBody())

	reader := bufio.NewReader(resp.RawBody())

	for {
		line, err := reader.ReadString('\n')
		if line == "\n" {
			continue
		}

		if strings.HasSuffix(line, "[DONE]\n") || err != nil {
			break
		}

		json.Unmarshal([]byte(line[5:]), &rdata)

		if rdata != nil {
			parts := rdata.Message.Content.Parts
			if len(parts) != 0 {
				ch <- parts[0]
			}

			if rdata.Message.EndTurn == true {
				break
			}

			conversationId = rdata.ConversationId
			parentMessageId = rdata.Message.Id
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

func SendQQMsg(msg string) {
	var apiUrl string
	var data url.Values

	switch qqData.MessageType {
	case "group":
		apiUrl = fmt.Sprintf("%s/send_group_msg", cqhttpApi)
		data = url.Values{"group_id": {groupId}, "message": {strings.TrimLeft(msg, "\n")}}

	case "private":
		apiUrl = fmt.Sprintf("%s/send_private_msg", cqhttpApi)
		data = url.Values{"user_id": {fmt.Sprintf("%v", qqData.UserId)}, "message": {strings.TrimLeft(msg, "\n")}}
	default:
		return
	}

	resp, err := http.PostForm(apiUrl, data)
	if err != nil {
		log.Println(err)
		return
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		log.Println(string(body), err)
		return
	}
}

func SendQQImage(img string) {
	var apiUrl string
	var data url.Values

	switch qqData.MessageType {
	case "group":
		apiUrl = fmt.Sprintf("%s/send_group_msg", cqhttpApi)
		data = url.Values{"group_id": {groupId}, "message": {fmt.Sprintf("[CQ:image,file=%s]", img)}}

	case "private":
		apiUrl = fmt.Sprintf("%s/send_private_msg", cqhttpApi)
		data = url.Values{"user_id": {fmt.Sprintf("%v", qqData.UserId)}, "message": {fmt.Sprintf("[CQ:image,file=%s]", img)}}
	default:
		return
	}

	resp, err := http.PostForm(apiUrl, data)
	if err != nil {
		log.Println(err)
		return
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		log.Println(string(body), err)
		return
	}
}

func checkTokens(messages *[]openai.ChatCompletionMessage, model string) {
	tkm, err := tiktoken.EncodingForModel(model)
	if err != nil {
		err = fmt.Errorf("EncodingForModel: %v", err)
		fmt.Println(err)
		return
	}

	var tokens_per_message int
	var tokens_per_name int
	if model == "gpt-3.5-turbo-0301" || model == "gpt-3.5-turbo" {
		tokens_per_message = 4
		tokens_per_name = -1
	} else if model == "gpt-4-0314" || model == "gpt-4" {
		tokens_per_message = 3
		tokens_per_name = 1
	} else {
		tokens_per_message = 3
		tokens_per_name = 1
	}

	var n int
	for _, message := range *messages {
		n += tokens_per_message
		n += len(tkm.Encode(message.Content, nil, nil))
		n += len(tkm.Encode(message.Role, nil, nil))
		n += len(tkm.Encode(message.Name, nil, nil))
		if message.Name != "" {
			n += tokens_per_name
		}
	}

	n += 3

	if n > maxTokens {
		*messages = (*messages)[2:]
		checkTokens(messages, model)
	}
}

func initConfig() {
	if _, err := os.Stat(configName); os.IsNotExist(err) {
		defaultConfig := Config{
			CqhttpApi:     "",
			GroupId:       "",
			OpenaiApi:     "",
			OpenAiApiKey:  "",
			HttpProxy:     "",
			Model:         openai.GPT3Dot5Turbo,
			MaxTokens:     1000,
			SystemPrompt:  "",
			QsystemPrompt: "",
		}

		file, err := os.Create(configName)
		if err != nil {
			log.Fatalf("Error creating config file: %v", err)
		}
		defer file.Close()

		encoder := toml.NewEncoder(file)
		err = encoder.Encode(defaultConfig)
		if err != nil {
			log.Fatalf("Error encoding config: %v", err)
		}
	}

	var conf Config
	if _, err := toml.DecodeFile("config.toml", &conf); err != nil {
		log.Fatal(err)
	}

	cqhttpApi = conf.CqhttpApi
	groupId = conf.GroupId
	openaiApi = conf.OpenaiApi
	openAiApiKey = conf.OpenAiApiKey
	httpProxy = conf.HttpProxy
	model = conf.Model
	maxTokens = conf.MaxTokens
	systemPrompt = conf.SystemPrompt
	qsystemPrompt = conf.QsystemPrompt
}

func init() {
	log.SetPrefix("[AI] ")
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	initConfig()
}

func main() {
	chat := ChatGpt()

	r := gin.Default()
	r.Use(cors.Default())
	templ := template.Must(template.New("").ParseFS(FS, "templates/*.*"))
	r.SetHTMLTemplate(templ)

	f, _ := fs.Sub(FS, "templates/static")
	r.StaticFS("/static", http.FS(f))

	r.NoRoute(func(c *gin.Context) {
		// c.HTML(http.StatusNotFound, "404.html", gin.H{"title": "Moss-全知全能"})
		c.HTML(http.StatusOK, "index.html", gin.H{"title": "Moss-全知全能"})
	})

	// r.GET("/", func(c *gin.Context) {
	// 	c.HTML(http.StatusOK, "index.html", gin.H{"title": "Moss-全知全能"})
	// })

	// r.GET("/c/:id", func(c *gin.Context) {
	// 	c.HTML(http.StatusOK, "index.html", gin.H{"title": "Moss-全知全能"})
	// 	// c.Redirect(302, "/")
	// })

	r.POST("/qai", func(c *gin.Context) {
		c.ShouldBindJSON(&qqData)

		re := regexp.MustCompile(`^\[[^\[\]]+\]\s*`)
		msg := re.ReplaceAllString(qqData.RawMessage, "")

		re1 := regexp.MustCompile(`^(图|图片|tu|image)`)

		if re1.MatchString(msg) {
			go chat.Image(re1.ReplaceAllString(msg, ""))
		} else {
			go chat.Conv(msg)
		}

		c.JSON(http.StatusOK, gin.H{})
	})

	r.POST("/ai", func(c *gin.Context) {
		var d struct {
			Messages []openai.ChatCompletionMessage `json:"messages"`
			Model    string
		}
		c.ShouldBindJSON(&d)

		ch := make(chan string)
		ctx := c.Request.Context()

		go func() {
			defer close(ch)
			err := chat.ConvStream(ctx, ch, d.Messages, d.Model)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
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

	r.POST("/wai", func(c *gin.Context) {
		var d struct {
			Model   string `json:"model"`
			Message string `json:"message"`
		}
		c.ShouldBindJSON(&d)

		ch := make(chan string)
		go chat.ConvStreamWeb(ch, d.Message, d.Model)

		c.Writer.Header().Set("Content-Type", "text/event-stream")

		for {
			msg, ok := <-ch

			if !ok {
				break
			}

			c.Writer.WriteString(msg)
			c.Writer.Flush()
		}
	})

	r.Run(":5800")
}
