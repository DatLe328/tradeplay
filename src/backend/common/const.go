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
	KeyCompRedis  = "redis"
)

const (
	DbTypeAuth            = 1
	DbTypeAccount         = 2
	DbTypeUser            = 3
	DbTypeOrder           = 4
	DbTypeBankTransaction = 5
	DbTypeWallet          = 6
	DbTypeAuditLog        = 7
)

const (
	MaskTypeAuth            = 1
	MaskTypeAccount         = 2
	MaskTypeUser            = 3
	MaskTypeOrder           = 4
	MaskTypeBankTransaction = 5
	MaskTypeWallet          = 6
	MaskTypeWalletTx        = 7
	MaskTypeAuditLog        = 8
)

const (
	ActionLoginFailed        = "LOGIN_FAILED"
	ActionLoginSuccess       = "LOGIN_SUCCESS"
	ActionLoginGoogleFailed  = "LOGIN_GOOGLE_FAILED"
	ActionLoginGoogleSuccess = "LOGIN_GOOGLE_SUCCESS"
	ActionLogout             = "LOGOUT"

	ActionResetPassFailed  = "RESET_PASS_FAILED"
	ActionResetPassSuccess = "RESET_PASS_SUCCESS"

	ActionCreateWalletFailed = "CREATE_WALLET_FAILED"

	ActionChangePasswordFailed  = "CHANGE_PASSWORD_FAILED"
	ActionChangePasswordSuccess = "CHANGE_PASSWORD_SUCCESS"

	ActionRegisterFailed  = "REGISTER_FAILED"
	ActionRegisterSuccess = "REGISTER_SUCCESS"

	ActionPushNotificationFailed = "PUSH_NOTIFICATION_FAILED"

	ActionVerifyEmailFailed  = "VERIFY_EMAIL_FAILED"
	ActionVerifyEmailSuccess = "VERIFY_EMAIL_SUCCESS"
)

const (
	MaskTypeOrderDisplay = 1
	MaskTypeUserDisplay  = 2
)

const (
	DefaultSaltLength = 16
)

func AppRecover() {
	if err := recover(); err != nil {
		log.Println("Recovery error:", err)
	}
}
