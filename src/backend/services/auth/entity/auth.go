package entity

import "tradeplay/common"

type AuthType int

const (
	AuthTypeEmailPassword = iota
	AuthTypeGoogle
)

type AuthStatus int

const (
	AuthStatusUnverified AuthStatus = iota
	AuthStatusVerified
	AuthStatusSuspended
)

type Auth struct {
	common.SQLModel
	UserID   int32      `json:"user_id" gorm:"column:user_id"`
	AuthType AuthType   `json:"auth_type" gorm:"column:auth_type"`
	Email    string     `json:"email" gorm:"column:email"`
	Password *string    `json:"password" gorm:"column:password"`
	Salt     *string    `json:"salt" gorm:"column:salt"`
	GoogleID *string    `json:"google_id" gorm:"column:google_id"`
	Status   AuthStatus `json:"status" gorm:"column:status"`
}

func (Auth) TableName() string { return "auths" }

func NewAuthWithEmailPassword(userID int32, email, password, salt string) *Auth {
	return &Auth{
		SQLModel: common.NewSQLModel(),
		UserID:   userID,
		AuthType: AuthTypeEmailPassword,
		Email:    email,
		Password: &password,
		Salt:     &salt,
		Status:   AuthStatusUnverified,
	}
}
