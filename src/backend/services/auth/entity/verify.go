package entity

import (
	"time"

	"github.com/DatLe328/service-context/core"
)

type VerifyType int

const (
	RegisterVerify VerifyType = iota
	ForgotPasswordVerify
	TwoFactorVerify
	PhoneVerify
)

type VerifyCode struct {
	core.SQLModel
	Email     string     `json:"email" gorm:"column:email"`
	Code      string     `json:"code" gorm:"column:code"`
	Type      VerifyType `json:"type" gorm:"column:type"`
	ExpiredAt time.Time  `json:"expired_at" gorm:"column:expired_at"`
	IsUsed    bool       `json:"is_used" gorm:"column:is_used;default:false;"`
	UsedAt    *time.Time `json:"used_at" gorm:"column:used_at;"`
}

func (VerifyCode) TableName() string { return "verify_codes" }

type VerifyData struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type UpdateStatusRequest struct {
	Status AuthStatus `json:"status"`
}

type VerifyEmailData struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
}
