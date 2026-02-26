package cmd

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"tradeplay/common"
	"tradeplay/components/cronc"
	"tradeplay/components/emailc"
	"tradeplay/components/ginc"
	sctxMdw "tradeplay/components/ginc/middleware"
	"tradeplay/components/gormc"
	"tradeplay/components/jwtc"
	"tradeplay/components/redisc"
	sctx "tradeplay/components/service-context"
	upload "tradeplay/components/uploadc"
	"tradeplay/composer"
	_ "tradeplay/docs"
	"tradeplay/middleware"
	authBusiness "tradeplay/services/auth/business"
	userRepository "tradeplay/services/user/repository/mysql"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/gin-gonic/gin"
)

func newServiceCtx() sctx.ServiceContext {
	return sctx.NewServiceContext(
		sctx.WithName("tradeplay"),
		sctx.WithComponent(NewConfig()),
		sctx.WithComponent(jwtc.NewJWT(common.KeyCompJWT)),
		sctx.WithComponent(ginc.NewGin(common.KeyCompGIN)),
		sctx.WithComponent(gormc.NewGormDB(common.KeyCompMySQL, "")),
		sctx.WithComponent(upload.NewUploadComponent(common.KeyCompUpload)),
		sctx.WithComponent(emailc.NewEmailProvider(common.KeyCompEmail)),
		sctx.WithComponent(redisc.NewRedis(common.KeyCompRedis)),
		sctx.WithComponent(cronc.NewCronComponent()),
	)
}

func setupRoute(serviceCtx sctx.ServiceContext, router *gin.RouterGroup) {
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)
	authBusiness := authBusiness.NewAuthBusiness(
		nil, nil, nil, nil, serviceCtx.MustGet(common.KeyCompJWT).(common.JWTProvider), nil, nil, redisComp)
	requireAuthMdw := middleware.RequireAuth(authBusiness)
	captchaMdw := middleware.VerifyTurnstile(serviceCtx)

	userAPI := composer.ComposeUserAPIService(serviceCtx)
	authAPI := composer.ComposeAuthAPIService(serviceCtx)
	accountAPI := composer.ComposeAccountAPIService(serviceCtx)
	orderAPI := composer.ComposeOrderAPIService(serviceCtx)
	walletAPI := composer.ComposeWalletAPIService(serviceCtx)
	notificationAPI := composer.ComposeNotificationService(serviceCtx)

	csrfProtection := middleware.CSRFProtection(serviceCtx)
	csrfValidate := middleware.ValidateCSRFToken()

	authRateLimit := middleware.RateLimitMiddleware(serviceCtx, 30, 10)
	orderRateLimit := middleware.RateLimitMiddleware(serviceCtx, 50, 10)
	browsingRateLimit := middleware.RateLimitMiddleware(serviceCtx, 200, 60)

	v1 := router.Group("/v1", browsingRateLimit, csrfProtection)

	user := v1.Group("/user")
	{
		user.GET("/me", requireAuthMdw, userAPI.GetUserProfileHandler())
		user.PATCH("/me", requireAuthMdw, csrfValidate, userAPI.PatchUserProfileHandler())
	}

	auth := v1.Group("/auth", authRateLimit)
	{
		auth.POST("/authenticate", captchaMdw, authAPI.LoginHdl())
		auth.POST("/register", captchaMdw, authAPI.RegisterHdl())
		auth.POST("/verify", authAPI.VerifyEmailHandler())
		auth.POST("/forgot-password", captchaMdw, authAPI.ForgotPasswordHandler())
		auth.POST("/reset-password", authAPI.ResetPasswordHandler())

		auth.GET("/google/login", authAPI.GoogleLoginHdl())
		auth.GET("/google/callback", authAPI.GoogleCallbackHdl())

		auth.POST("/refresh-token", authAPI.RefreshTokenHandler())
		auth.POST("/logout", authAPI.LogoutHdl())
		auth.PATCH("/change-password", requireAuthMdw, csrfValidate, authAPI.ChangePasswordHandler())
	}

	account := v1.Group("/accounts", csrfValidate)
	{
		account.GET("", accountAPI.FindAccountsHandler())
		account.GET("/:id", accountAPI.GetAccountHandler())
		account.GET("/:id/credentials", requireAuthMdw, accountAPI.GetAccountCredentialsHandler())
	}

	orders := v1.Group("/orders", requireAuthMdw, csrfValidate, orderRateLimit)
	{
		orders.GET("", orderAPI.FindOrdersHandler())
		orders.GET("/:id", orderAPI.GetOrderHandler())
		orders.POST("", orderAPI.CreateOrderHandler())
	}

	wallets := v1.Group("/wallets", requireAuthMdw, csrfValidate)
	{
		wallets.GET("/me", walletAPI.GetMeHandler())
	}

	notifications := v1.Group("/notifications", requireAuthMdw, csrfValidate)
	{
		notifications.GET("", notificationAPI.ListNotificationsHandler())
		notifications.GET("/unread/count", notificationAPI.GetUnreadCountHandler())
		notifications.GET("/:id", notificationAPI.GetNotificationHandler())
		notifications.PATCH("/:id/read", notificationAPI.MarkAsReadHandler())
		notifications.POST("/read-all", notificationAPI.MarkAllAsReadHandler())
		notifications.DELETE("/:id", notificationAPI.DeleteNotificationHandler())
	}
}

func setupWebhook(serviceCtx sctx.ServiceContext, router *gin.RouterGroup) {
	paymentAPI := composer.ComposePaymentAPIService(serviceCtx)

	v1 := router.Group("/v1",
		middleware.RateLimitMiddleware(serviceCtx, 120, 60),
	)
	v1.POST("/webhook/sepay", paymentAPI.HandleSepayWebhook)
}

func setupAdminRoute(serviceCtx sctx.ServiceContext, router *gin.RouterGroup) {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)
	authBusiness := authBusiness.NewAuthBusiness(
		nil, nil, nil, nil, serviceCtx.MustGet(common.KeyCompJWT).(common.JWTProvider), nil, nil, redisComp)
	userRepo := userRepository.NewMySQLRepository(db.GetDB())
	requireAuthMdw := middleware.RequireAuth(authBusiness)
	requireAdminMdw := middleware.RequireAdmin(serviceCtx, userRepo)
	csrfProtection := middleware.CSRFProtection(serviceCtx)
	csrfValidate := middleware.ValidateCSRFToken()

	uploadAPI := composer.ComposeUploadAPIService(serviceCtx)
	auditAPI := composer.ComposeAuditAPIService(serviceCtx)

	v1Admin := router.Group("/v1/admin", middleware.RateLimitMiddleware(serviceCtx, 1000, 60))
	v1Admin.Use(requireAuthMdw, requireAdminMdw, csrfProtection)

	accountAPI := composer.ComposeAccountAPIService(serviceCtx)
	orderAPI := composer.ComposeOrderAPIService(serviceCtx)

	account := v1Admin.Group("/accounts", csrfValidate)
	{
		account.POST("", accountAPI.CreateAccountHandler())
		account.PATCH("/:id", accountAPI.UpdateAccountHandler())
		account.DELETE("/:id", accountAPI.DeleteAccountHandler())
		account.GET("/:id/credentials", accountAPI.AdminGetAccountCredentialsHandler())
	}

	orders := v1Admin.Group("/orders", csrfValidate)
	{
		orders.GET("", orderAPI.FindOrdersAdminHandler())
		orders.PATCH("/:id", orderAPI.UpdateOrderStatusHandler())
	}

	admin := v1Admin.Group("", csrfValidate)
	{
		admin.POST("/upload/presign", uploadAPI.GeneratePresignedURLHandler())
		admin.GET("/audit-logs", auditAPI.ListAuditLogsHandler())
	}
}

func setupSwagger(serviceCtx sctx.ServiceContext, router *gin.RouterGroup) {
	if serviceCtx.EnvName() != sctx.DevEnv {
		log.Println("Swagger UI is only enabled in development environment")
		return
	}
	swagger := router.Group("/swagger")
	swagger.GET("/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}

func Execute() {
	serviceCtx := newServiceCtx()

	if err := serviceCtx.Load(); err != nil {
		log.Fatalln(err)
	}
	defer serviceCtx.Stop()

	composer.RunNotificationWorker(serviceCtx)
	composer.RunAuditWorker(serviceCtx)

	ginComp := serviceCtx.MustGet(common.KeyCompGIN).(common.GinEngine)
	router := ginComp.GetRouter()

	router.Use(gin.Recovery(), gin.Logger(), sctxMdw.Recovery(serviceCtx))
	router.Use(middleware.Cors(serviceCtx))
	router.Use(middleware.SecurityHeaders())
	router.Use(
		middleware.MaintenanceSensitiveOnly(serviceCtx),
	)

	apiGroup := router.Group("/api")
	setupRoute(serviceCtx, apiGroup)
	setupAdminRoute(serviceCtx, apiGroup)
	setupWebhook(serviceCtx, apiGroup)
	setupSwagger(serviceCtx, apiGroup)

	ginComp.Run()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down application...")
}
