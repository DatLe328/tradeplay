package entity

import (
	"time"
	"tradeplay/common"
)

type UserToken struct {
	common.SQLModel
	UserId    int32     `gorm:"column:user_id;"`
	TokenId   string    `gorm:"column:token_id;"`
	Token     string    `gorm:"column:token;"`
	ExpiresAt time.Time `gorm:"column:expires_at;"`
	IsRevoked bool      `gorm:"column:is_revoked;default:false;"`
	IpAddress string    `gorm:"column:ip_address;"`
	UserAgent string    `gorm:"column:user_agent;"`
}

func (UserToken) TableName() string {
	return "user_tokens"
}

func NewUserToken(
	userID int32,
	tokenID string,
	token string,
	expiresAt time.Time,
	ipAddress string,
	userAgent string,
) *UserToken {
	return &UserToken{
		SQLModel:  common.NewSQLModel(),
		UserId:    userID,
		TokenId:   tokenID,
		Token:     token,
		ExpiresAt: expiresAt,
		IpAddress: ipAddress,
		UserAgent: userAgent,
	}
}
