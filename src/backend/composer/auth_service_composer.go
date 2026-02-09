package composer

import (
	"tradeplay/common"
	auditRepository "tradeplay/services/audit/repository/mysql"
	authBusiness "tradeplay/services/auth/business"
	authRepository "tradeplay/services/auth/repository/mysql"
	authAPI "tradeplay/services/auth/transport/api"
	userBusiness "tradeplay/services/user/business"
	userRepository "tradeplay/services/user/repository/mysql"
	walletBusiness "tradeplay/services/wallet/business"
	walletRepository "tradeplay/services/wallet/repository/mysql"

	sctx "tradeplay/components/service-context"

	"github.com/gin-gonic/gin"
)

type AuthService interface {
	LoginHdl() gin.HandlerFunc
	RegisterHdl() gin.HandlerFunc
	VerifyEmailHandler() gin.HandlerFunc
	ForgotPasswordHandler() gin.HandlerFunc
	ResetPasswordHandler() gin.HandlerFunc
	GoogleCallbackHdl() gin.HandlerFunc
	GoogleLoginHdl() gin.HandlerFunc
	RefreshTokenHandler() gin.HandlerFunc
	LogoutHdl() gin.HandlerFunc
	ChangePasswordHandler() gin.HandlerFunc
}

func ComposeAuthAPIService(serviceCtx sctx.ServiceContext) AuthService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	jwtComp := serviceCtx.MustGet(common.KeyCompJWT).(common.JWTProvider)
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)
	emailComp := serviceCtx.MustGet(common.KeyCompEmail).(common.EmailComponent)
	hasher := new(common.Hasher)

	authRepository := authRepository.NewMySQLRepository(db.GetDB())
	userRepository := userRepository.NewMySQLRepository(db.GetDB())
	walletRepository := walletRepository.NewMySQLRepository(db.GetDB())
	auditRepository := auditRepository.NewMySQLRepository(db.GetDB(), redisComp)

	walletBusiness := walletBusiness.NewWalletBusiness(walletRepository, auditRepository)
	userBusiness := userBusiness.NewUserBusiness(userRepository)

	authBusiness := authBusiness.NewAuthBusiness(
		authRepository,
		userBusiness,
		walletBusiness,
		auditRepository,
		jwtComp,
		hasher,
		emailComp,
		redisComp,
	)

	serviceAPI := authAPI.NewAuthAPI(serviceCtx, authBusiness)

	return serviceAPI
}
