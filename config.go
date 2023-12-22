package main

import (
	"crypto/rand"
	"encoding/base64"

	"github.com/spf13/viper"
)

var (
	title            string // 系统标题
	cqhttpApi        string // cqhttp api
	groupId          string // 发送消息的qq群
	zaobApi          string // 早报api
	openaiApi        string // openai api
	openAiApiKey     string // openai api secret key
	openAiApiKeyGpt4 string // openai api secret key
	httpProxy        string // openai代理
	model            string // 使用模型
	maxTokens        int    // 限制token数量
	maxGpt3          int    // 限制gpt3会话次数
	maxGpt4          int    // 限制gpt4会话次数
	webSearchApi     string // web搜索api
	systemPrompt     string // openai系统提示
	qsystemPrompt    string // qq openai系统提示
	secretKey        string // session加密key
	geminiApi        string // gemini api
	geminiApiKey     string // gemini api secret key
)

func initConfig() {
	sk := make([]byte, 30)
	rand.Read(sk)

	viper.SetDefault("base.title", "Moss-全知全能")
	viper.SetDefault("base.cqhttp_api", "")
	viper.SetDefault("base.cqhttp_group_id", "")
	viper.SetDefault("base.zaob_api", "http://dwz.2xb.cn/zaob")
	viper.SetDefault("base.http_proxy", "")
	viper.SetDefault("base.search_api", "")
	viper.SetDefault("base.max_gpt3", 10)
	viper.SetDefault("base.max_gpt4", 5)
	viper.SetDefault("base.secret_key", base64.RawURLEncoding.EncodeToString(sk))

	viper.SetDefault("openai.api", "")
	viper.SetDefault("openai.api_key", "")
	viper.SetDefault("openai.api_key_gpt4", "")
	viper.SetDefault("openai.model", "gpt-3.5-turbo")
	viper.SetDefault("openai.max_tokens", 1000)
	viper.SetDefault("openai.system_prompt", "")
	viper.SetDefault("openai.qsystem_rompt", "")

	viper.SetDefault("genmini.api", "")
	viper.SetDefault("genmini.api_key", "")

	viper.SetConfigName("config")
	viper.AddConfigPath(".")
	viper.SetConfigType("yaml")

	err := viper.ReadInConfig()
	if err != nil {
		viper.SafeWriteConfig()
	}

	title = viper.GetString("base.title")
	cqhttpApi = viper.GetString("base.cqhttp_api")
	groupId = viper.GetString("base.cqhttp_group_id")
	zaobApi = viper.GetString("base.zaob_api")
	httpProxy = viper.GetString("base.http_proxy")
	webSearchApi = viper.GetString("base.search_api")
	maxGpt3 = viper.GetInt("base.max_gpt3")
	maxGpt4 = viper.GetInt("base.max_gpt4")
	secretKey = viper.GetString("base.secret_key")

	openaiApi = viper.GetString("openai.api")
	openAiApiKey = viper.GetString("openai.api_key")
	openAiApiKeyGpt4 = viper.GetString("openai.api_key_gpt4")
	model = viper.GetString("openai.model")
	maxTokens = viper.GetInt("openai.max_tokens")
	systemPrompt = viper.GetString("openai.system_prompt")
	qsystemPrompt = viper.GetString("openai.qsystem_prompt")

	geminiApi = viper.GetString("genmini.api")
	geminiApiKey = viper.GetString("genmini.api_key")
}
