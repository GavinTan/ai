package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type Sender struct {
	UserId   int64  `json:"user_id"`   // 发送者 QQ 号
	Nickname string `json:"nick_name"` // 昵称
	Sex      string `json:"sex"`       // 性别, male 或 female 或 unknown
	Age      int32  `json:"age"`       // 年龄
	Card     string `json:"card"`      // 群名片／备注
	Area     string `json:"area"`      // 地区
	Level    string `json:"level"`     // 成员等级
	Role     string `json:"role"`      // 角色, owner 或 admin 或 member
	Title    string `json:"title"`     // 专属头衔
}

type Message struct {
	MessageType string `json:"message_type"` // private, group	消息类型
	SubType     string `json:"sub_type"`     // group, public	表示消息的子类型
	MessageId   int32  `json:"message_id"`   // 消息 ID
	UserId      int64  `json:"user_id"`      // 发送者 QQ 号
	Message     string `json:"message"`      // 一个消息链
	RawMessage  string `json:"raw_message"`  // CQ 码格式的消息
	Font        int    `json:"font"`         // 0	字体
	Sender      Sender `json:"sender"`       // 发送者信息

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
		logger.Println(err)
		return
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		logger.Println(string(body), err)
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
		logger.Println(err)
		return
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		logger.Println(string(body), err)
		return
	}
}
