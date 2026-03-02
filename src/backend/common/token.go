package common

import "time"

type TokenClaims struct {
	ID        string
	Subject   string
	ExpiresAt time.Time
	IssuedAt  time.Time
}
