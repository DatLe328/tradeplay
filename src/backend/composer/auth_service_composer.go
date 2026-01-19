package composer

import (
	"tradeplay/common"
	"tradeplay/services/auth/business"
	authRepo "tradeplay/services/auth/repository/mysql"
	"tradeplay/services/auth/transport/api"
	userRepo "tradeplay/services/user/repository/mysql"
	walletRepo "tradeplay/services/wallet/repository/mysql"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type AuthService interface {
	LoginHdl() func(*gin.Context)
	RegisterHdl() func(*gin.Context)
	UpdateAuthStatusHandler() func(*gin.Context)
	VerifyEmailHandler() func(*gin.Context)
	ForgotPasswordHandler() func(*gin.Context)
	ResetPasswordHandler() func(*gin.Context)
	GoogleCallbackHdl() gin.HandlerFunc
	GoogleLoginHdl() gin.HandlerFunc
	RefreshTokenHandler() func(*gin.Context)
	LogoutHdl() func(*gin.Context)
	ChangePasswordHandler() gin.HandlerFunc
}

func ComposeAuthAPIService(serviceCtx sctx.ServiceContext) AuthService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	jwtComp := serviceCtx.MustGet(common.KeyCompJWT).(common.JWTProvider)

	authRepository := authRepo.NewMySQLRepository(db.GetDB())
	hasher := new(common.Hasher)
	userRepository := userRepo.NewMySQLRepository(db.GetDB())
	walletRepository := walletRepo.NewMySQLRepository(db.GetDB())
	emailProvider := serviceCtx.MustGet(common.KeyCompEmail).(common.EmailComponent)
	biz := business.NewBusiness(authRepository, userRepository, walletRepository, jwtComp, hasher, emailProvider)

	serviceAPI := api.NewAPI(serviceCtx, biz)

	return serviceAPI
}
