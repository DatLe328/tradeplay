package entity

import (
	"net/mail"
	"strings"
)

func checkEmailIsValid(email string) error {
	_, err := mail.ParseAddress(email)

	if err != nil {
		return ErrEmailIsNotValid
	}
	return nil
}

func checkPassword(password string) error {
	if len(password) < 8 {
		return ErrPasswordIsNotValid
	}
	if len(password) > 30 {
		return ErrPasswordIsNotValid
	}

	return nil
}

func checkFirstName(firstName string) error {
	firstName = strings.TrimSpace(firstName)

	if firstName == "" {
		return ErrFirstNameIsEmpty
	}

	if len(firstName) > 17 {
		return ErrFirstNameTooLong
	}
	return nil
}

func checkLastName(lastName string) error {
	lastName = strings.TrimSpace(lastName)

	if lastName == "" {
		return ErrLastNameIsEmpty
	}

	if len(lastName) > 17 {
		return ErrLastNameTooLong
	}
	return nil
}
