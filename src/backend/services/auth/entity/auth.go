package entity

import "github.com/DatLe328/service-context/core"

type AuthType string
type AuthStatus string

const (
	AuthTypeEmailPassword AuthType = "email_password"
	AuthTypeGoogle        AuthType = "google"
)

const (
	AuthStatusActive   AuthStatus = "active"
	AuthStatusInactive AuthStatus = "inactive"
	AuthStatusBanned   AuthStatus = "banned"
)

type Auth struct {
	core.SQLModel
	UserID     int64      `json:"user_id" gorm:"column:user_id"`
	AuthType   AuthType   `json:"auth_type" gorm:"column:auth_type"`
	Email      string     `json:"email" gorm:"column:email"`
	Password   *string    `json:"password" gorm:"column:password"`
	Salt       *string    `json:"salt" gorm:"column:salt"`
	FacebookID *string    `json:"facebook_id" gorm:"column:facebook_id"`
	GoogleID   *string    `json:"google_id" gorm:"column:google_id"`
	Status     AuthStatus `json:"status" gorm:"column:status" default:"inactive"`
}

func (Auth) TableName() string { return "auths" }

func NewAuthWithEmailPassword(userId int, email, password, salt string) *Auth {
	return &Auth{
		SQLModel: core.NewSQLModel(),
		UserID:   int64(userId),
		AuthType: AuthTypeEmailPassword,
		Email:    email,
		Password: &password,
		Salt:     &salt,
		Status:   AuthStatusInactive,
	}
}
