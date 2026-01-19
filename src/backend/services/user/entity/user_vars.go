package entity

import (
	"strings"

	"github.com/DatLe328/service-context/core"
)

type UserDataCreation struct {
	core.SQLModel
	FirstName  string     `json:"first_name" gorm:"column:first_name"`
	LastName   string     `json:"last_name" gorm:"column:last_name"`
	SystemRole SystemRole `json:"-" gorm:"column:system_role"`
	Status     Status     `json:"-" gorm:"column:status"`
}

func NewUserCreation(firstName, lastName string) *UserDataCreation {
	return &UserDataCreation{
		FirstName:  firstName,
		LastName:   lastName,
		SystemRole: RoleUser,
		Status:     StatusInactive,
	}
}

func (*UserDataCreation) TableName() string { return User{}.TableName() }

func (u *UserDataCreation) Validate() error {
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

type UserDataPatch struct {
	FirstName *string `json:"first_name" gorm:"first_name"`
	LastName  *string `json:"last_name" gorm:"last_name"`
	Phone     *string `json:"phone_number" gorm:"phone_number"`
}

func (*UserDataPatch) TableName() string { return User{}.TableName() }

func (u *UserDataPatch) Validate() error {
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

func (u *UserDataPatch) ToUpdateMap() map[string]interface{} {
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

	return updates
}
