package entity

import (
	"strings"
	"time"
	"tradeplay/common"
)

type UserCreateDTO struct {
	common.SQLModel
	FirstName  string     `json:"first_name" gorm:"column:first_name"`
	LastName   string     `json:"last_name" gorm:"column:last_name"`
	SystemRole SystemRole `json:"-" gorm:"column:system_role"`
	Status     Status     `json:"-" gorm:"column:status"`
}

func NewUserCreateDTO(firstName, lastName string) *UserCreateDTO {
	return &UserCreateDTO{
		SQLModel:   common.NewSQLModel(),
		FirstName:  firstName,
		LastName:   lastName,
		SystemRole: RoleUser,
		Status:     StatusInactive,
	}
}

func (*UserCreateDTO) TableName() string { return User{}.TableName() }

func (u *UserCreateDTO) Validate() error {
	u.FirstName = strings.TrimSpace(u.FirstName)

	if err := checkFirstName(u.FirstName); err != nil {
		return err
	}

	u.LastName = strings.TrimSpace(u.LastName)

	if err := checkLastName(u.LastName); err != nil {
		return err
	}

	if err := checkStatus(u.Status); err != nil {
		return err
	}

	if err := checkRole(u.SystemRole); err != nil {
		return err
	}

	return nil
}

type UserUpdateDTO struct {
	FirstName *string    `json:"first_name" gorm:"first_name"`
	LastName  *string    `json:"last_name" gorm:"last_name"`
	Phone     *string    `json:"phone_number" gorm:"phone_number"`
	UpdatedAt *time.Time `json:"updated_at" gorm:"column:updated_at;"`
}

func (*UserUpdateDTO) TableName() string { return User{}.TableName() }

func (u *UserUpdateDTO) Validate() error {
	if u.FirstName != nil {
		*u.FirstName = strings.TrimSpace(*u.FirstName)
		if err := checkFirstName(*u.FirstName); err != nil {
			return err
		}
	}

	if u.LastName != nil {
		*u.LastName = strings.TrimSpace(*u.LastName)
		if err := checkLastName(*u.LastName); err != nil {
			return err
		}
	}

	if u.Phone != nil {
		if err := checkPhoneNumber(*u.Phone); err != nil {
			return err
		}
	}

	return nil
}

func (u *UserUpdateDTO) ToUpdateMap() map[string]interface{} {
	updates := map[string]interface{}{}

	if u.FirstName != nil {
		updates["first_name"] = *u.FirstName
	}
	if u.LastName != nil {
		updates["last_name"] = *u.LastName
	}
	if u.Phone != nil {
		updates["phone_number"] = *u.Phone
	}
	now := time.Now().UTC()
	u.UpdatedAt = &now
	updates["updated_at"] = u.UpdatedAt

	return updates
}
