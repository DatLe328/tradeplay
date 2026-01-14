package entity

import (
	"time"

	"github.com/DatLe328/service-context/core"
)

type UserVerifyCode struct {
	core.SQLModel
	Email     string    `json:"email" gorm:"column:email;"`
	Code      string    `json:"code" gorm:"column:code;"`
	ExpiredAt time.Time `json:"expired_at" gorm:"column:expired_at;"`
	Type      string    `json:"type" gorm:"column:type;"`
}

func (UserVerifyCode) TableName() string { return "user_verify_codes" }
