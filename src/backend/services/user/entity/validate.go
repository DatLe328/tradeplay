package entity

import (
	"regexp"
	"strings"
)

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

func checkRole(r SystemRole) error {
	if r != RoleUser && r != RoleAdmin {
		return ErrRoleIsNotValid
	}

	return nil
}

func checkStatus(s Status) error {

	if s != StatusActive && s != StatusInactive {
		return ErrStatusIsNotValid
	}

	return nil
}

func checkPhoneNumber(s string) error {
	re := regexp.MustCompile(`^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$`)

	if !re.MatchString(s) {
		return ErrPhoneIsNotValid
	}

	return nil
}
