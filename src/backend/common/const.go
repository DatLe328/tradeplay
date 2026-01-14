package common

import "log"

const (
	KeyCompJWT    = "jwt"
	KeyCompGIN    = "gin"
	KeyCompMySQL  = "mysql"
	KeyCompEmail  = "email"
	KeyCompUpload = "upload"
)

const (
	DbTypeAccount = 1
	DbTypeUser    = 2
	DbTypeOrder   = 3
)

const (
	MaskTypeAccount = 1
	MaskTypeUser    = 2
	MaskTypeOrder   = 3
)

type ContextKey string

const (
	KeyIsAdmin ContextKey = "is_admin"
)

func AppRecover() {
	if err := recover(); err != nil {
		log.Println("Recovery error:", err)
	}
}
