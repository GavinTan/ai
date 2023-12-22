package main

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        uint       `gorm:"primarykey" json:"id"`
	Name      string     `json:"name"`
	Username  string     `gorm:"uniqueIndex" json:"username"`
	Password  string     `json:"password,omitempty"`
	Disabled  bool       `gorm:"default:false" json:"disabled"`
	Role      string     `gorm:"default:guest" json:"role"`
	Gpt3      int        `gorm:"default:0" json:"gpt3"`
	Gpt4      int        `gorm:"default:0" json:"gpt4"`
	M         int        `gorm:"default:0" json:"m"`
	CreatedAt *time.Time `json:"createdAt,omitempty"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

func (u User) All() (users []User) {
	db.Select("id, name, username, disabled, role, gpt3, gpt4, m, created_at").Find(&users)
	return
}

func (u User) Create() error {
	if u.Username == "" || u.Password == "" {
		return fmt.Errorf("非法请求")
	}

	ep, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	u.Password = string(ep)

	result := db.Create(&u)
	return result.Error
}

func (u User) Update() error {
	if u.Password != "" {
		ep, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		u.Password = string(ep)
	} else {
		var user User
		db.First(&user, u.ID)
		u.Password = user.Password
	}

	result := db.Save(&u)
	return result.Error
}

func (u User) Delete() error {
	result := db.WithContext(context.Background()).Unscoped().Delete(&u)
	return result.Error
}

func (u User) Login() error {
	p := u.Password
	db.First(&u, "username = ?", u.Username)
	if u.Disabled {
		return fmt.Errorf("账号已禁用")
	}

	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(p))
	if err == nil {
		return nil
	}

	return fmt.Errorf("账号密码错误")
}

func (u User) Info() User {
	db.First(&u, "username = ?", u.Username)
	return u
}

func (u User) Count(model string) {
	db.First(&u, "username = ?", u.Username)

	switch model {
	case "gpt-4":
		u.Gpt4 += 1
	case "gpt-3.5-turbo-16k":
		u.Gpt3 += 1
	}

	db.Save(&u)
}
