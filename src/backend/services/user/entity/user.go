package entity

import (
	"strings"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
)

type SystemRole string

const (
	RoleAdmin SystemRole = "admin"
	RoleUser  SystemRole = "user"
)

type Status int

const (
	StatusActive Status = iota + 1
	StatusDisable
)

type User struct {
	core.SQLModel
	FirstName  string     `json:"first_name" gorm:"column:first_name" db:"first_name"`
	LastName   string     `json:"last_name" gorm:"column:last_name" db:"last_name"`
	Phone      string     `json:"phone" gorm:"column:phone" db:"phone"`
	SystemRole SystemRole `json:"system_role" gorm:"column:system_role" db:"system_role"`
	Status     Status     `json:"status" gorm:"column:status" db:"status"`
	Email      string     `json:"email" gorm:"-"`
}

func NewUser(firstName, lastName, email string) User {
	return User{
		SQLModel:   core.NewSQLModel(),
		FirstName:  firstName,
		LastName:   lastName,
		Phone:      "",
		SystemRole: RoleUser,
		Status:     StatusDisable,
	}
}

func (User) TableName() string { return "users" }

func (u *User) Validate() error {
	u.FirstName = strings.TrimSpace(u.FirstName)
	if err := checkFirstName(u.FirstName); err != nil {
		return err
	}

	u.LastName = strings.TrimSpace(u.LastName)
	if err := checkLastName(u.LastName); err != nil {
		return err
	}
	return nil
}

func (u *User) Mask() {
	u.SQLModel.Mask(common.MaskTypeUser)
}
