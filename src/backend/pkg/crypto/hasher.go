package crypto

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

const PasswordCost = 12

type Hasher struct{}

func (r *Hasher) RandomStr(length int) (string, error) {
	var b = make([]byte, length)

	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(b), nil
}

func (r *Hasher) HashPassword(salt, password string) (string, error) {
	spStr := fmt.Sprintf("%s.%s", salt, password)

	h, err := bcrypt.GenerateFromPassword([]byte(spStr), PasswordCost)
	if err != nil {
		return "", err
	}

	return string(h), nil
}

func (r *Hasher) CompareHashPassword(hashedPassword, salt, password string) bool {
	spStr := fmt.Sprintf("%s.%s", salt, password)
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(spStr)) == nil
}
