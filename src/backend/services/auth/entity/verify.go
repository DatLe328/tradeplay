package entity

import (
	"time"
	"tradeplay/common"
)

type VerifyType int

const (
	RegisterVerify VerifyType = iota
	ForgotPasswordVerify
	TwoFactorVerify
	PhoneVerify
)

type VerifyCode struct {
	common.SQLModel
	Email     string     `json:"email" gorm:"column:email"`
	Code      string     `json:"code" gorm:"column:code"`
	Type      VerifyType `json:"type" gorm:"column:type"`
	ExpiredAt time.Time  `json:"expired_at" gorm:"column:expired_at"`
	IsUsed    bool       `json:"is_used" gorm:"column:is_used;"`
	UsedAt    *time.Time `json:"used_at" gorm:"column:used_at;"`
}

func (VerifyCode) TableName() string { return "verify_codes" }

func NewVerifyCode(email, code string, vType VerifyType, expiredAt time.Time) *VerifyCode {
	return &VerifyCode{
		SQLModel:  common.NewSQLModel(),
		Email:     email,
		Code:      code,
		Type:      vType,
		ExpiredAt: expiredAt,
		IsUsed:    false,
	}
}
