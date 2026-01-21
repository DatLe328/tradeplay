package common

import "log"

const (
	KeyCompJWT    = "jwt"
	KeyCompGIN    = "gin"
	KeyCompMySQL  = "mysql"
	KeyCompEmail  = "email"
	KeyCompUpload = "upload"
	KeyCompConf   = "config"
	KeyCompCron   = "cron"
)

const (
	DbTypeAuth            = 1
	DbTypeAccount         = 2
	DbTypeUser            = 3
	DbTypeOrder           = 4
	DbTypeBankTransaction = 5
	DbTypeWallet          = 6
)

const (
	MaskTypeAuth            = 1
	MaskTypeAccount         = 2
	MaskTypeUser            = 3
	MaskTypeOrder           = 4
	MaskTypeBankTransaction = 5
	MaskTypeWallet          = 6
	MaskTypeWalletTx        = 7
)

type ContextKey string

const (
	KeyIsAdmin ContextKey = "is_admin"
)

const (
	DefaultCurrency   = "VND"
	DefaultSaltLength = 16
)

func AppRecover() {
	if err := recover(); err != nil {
		log.Println("Recovery error:", err)
	}
}
