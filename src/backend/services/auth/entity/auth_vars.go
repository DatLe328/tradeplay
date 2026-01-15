package entity

import (
	"strings"
)

type AuthEmailPassword struct {
	Email    string `json:"email" form:"email"`
	Password string `json:"password" form:"password"`
}

func (aep *AuthEmailPassword) Validate() error {
	aep.Email = strings.TrimSpace(aep.Email)
	if err := checkEmailIsValid(aep.Email); err != nil {
		return err
	}

	aep.Password = strings.TrimSpace(aep.Password)
	if err := checkPassword(aep.Password); err != nil {
		return err
	}

	return nil
}

type AuthRegister struct {
	AuthEmailPassword
	FirstName string `json:"first_name" form:"first_name"`
	LastName  string `json:"last_name" form:"last_name"`
}

func (ar *AuthRegister) Validate() error {
	ar.Email = strings.TrimSpace(ar.Email)

	if err := checkEmailIsValid(ar.Email); err != nil {
		return err
	}

	ar.Password = strings.TrimSpace(ar.Password)

	if err := checkPassword(ar.Password); err != nil {
		return err
	}

	if err := checkLastName(ar.LastName); err != nil {
		return err
	}

	if err := checkFirstName(ar.FirstName); err != nil {
		return err
	}

	return nil
}

type ResetPasswordData struct {
	Email       string `json:"email"`
	Code        string `json:"code"`
	NewPassword string `json:"new_password"`
}

type Token struct {
	Token string `json:"token"`
	// ExpiredIn in seconds
	ExpiredIn int `json:"expire_in"`
}

type TokenResponse struct {
	AccessToken Token `json:"access_token"`
	// RefreshToken will be used when access token expired
	// to issue new pair access token and refresh token.
	RefreshToken *Token `json:"refresh_token,omitempty"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required,min=8"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

func (cpr *ChangePasswordRequest) Validate() error {
	cpr.OldPassword = strings.TrimSpace(cpr.OldPassword)
	if err := checkPassword(cpr.OldPassword); err != nil {
		return err
	}

	cpr.NewPassword = strings.TrimSpace(cpr.NewPassword)
	if err := checkPassword(cpr.NewPassword); err != nil {
		return err
	}

	return nil
}
