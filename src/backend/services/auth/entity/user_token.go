package entity

import (
	"time"

	"github.com/DatLe328/service-context/core"
)

type UserToken struct {
	core.SQLModel
	UserId    int       `gorm:"column:user_id;"`
	TokenId   string    `gorm:"column:token_id;"`
	Token     string    `gorm:"column:token;"`
	ExpiresAt time.Time `gorm:"column:expires_at;"`
	IsRevoked bool      `gorm:"column:is_revoked;default:false;"`
}

func (UserToken) TableName() string {
	return "user_tokens"
}
