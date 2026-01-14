package cmd

import (
	"fmt"
	"log"
	"net/http"
	"time"
	"tradeplay/common"
	"tradeplay/components/emailc"
	upload "tradeplay/components/uploadc"
	"tradeplay/composer"
	"tradeplay/middleware"
	authBusiness "tradeplay/services/auth/business"
	userRepository "tradeplay/services/user/repository/mysql"

	sctx "github.com/DatLe328/service-context"
	"github.com/DatLe328/service-context/component/ginc"
	sctxMdw "github.com/DatLe328/service-context/component/ginc/middleware"
	"github.com/DatLe328/service-context/component/gormc"
	"github.com/DatLe328/service-context/component/jwtc"
	"github.com/gin-gonic/gin"
)

func newServiceCtx() sctx.ServiceContext {
	return sctx.NewServiceContext(
		sctx.WithName("tradeplay"),
		sctx.WithComponent(jwtc.NewJWT(common.KeyCompJWT)),
		sctx.WithComponent(ginc.NewGin(common.KeyCompGIN)),
		sctx.WithComponent(gormc.NewGormDB(common.KeyCompMySQL, "")),
		sctx.WithComponent(upload.NewUploadComponent(common.KeyCompUpload)),
		sctx.WithComponent(emailc.NewEmailProvider(common.KeyCompEmail)),
	)
}

func setupRoute(serviceCtx sctx.ServiceContext, router *gin.Engine) {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	authBusiness := authBusiness.NewBusiness(nil, nil, serviceCtx.MustGet(common.KeyCompJWT).(common.JWTProvider), nil, nil)
	userRepo := userRepository.NewMySQLRepository(db.GetDB())
	requireAuthMdw := middleware.RequireAuth(authBusiness)
	identifyMdw := middleware.IdentifyAdmin(userRepo)
	captchaMdw := middleware.VerifyTurnstile()

	userAPI := composer.ComposeUserAPIService(serviceCtx)
	authAPI := composer.ComposeAuthAPIService(serviceCtx)
	accountAPI := composer.ComposeAccountAPIService(serviceCtx)
	orderAPI := composer.ComposeOrderAPIService(serviceCtx)

	csrfProtection := middleware.CSRFProtection()
	csrfValidate := middleware.ValidateCSRFToken()

	v1 := router.Group("/v1",
		middleware.RateLimitMiddleware(5, 10),
		csrfProtection,
	)

	user := v1.Group("/user")
	{
		user.GET("/me", requireAuthMdw, userAPI.GetUserProfileHandler())
		user.PATCH("/me", requireAuthMdw, csrfValidate, userAPI.PatchUserProfileHandler())
	}

	auth := v1.Group("/auth")
	{
		auth.POST("/authenticate", captchaMdw, authAPI.LoginHdl())
		auth.POST("/register", captchaMdw, authAPI.RegisterHdl())
		auth.POST("/verify", csrfValidate, authAPI.VerifyEmailHandler())
		auth.POST("/forgot-password", captchaMdw, authAPI.ForgotPasswordHandler())
		auth.POST("/reset-password", authAPI.ResetPasswordHandler())
		auth.GET("/google/login", authAPI.GoogleLoginHdl())
		auth.GET("/google/callback", authAPI.GoogleCallbackHdl())
		auth.POST("/refresh-token", csrfValidate, authAPI.RefreshTokenHandler())
		auth.POST("/logout", csrfValidate, authAPI.LogoutHdl())
	}

	account := v1.Group("/accounts")
	{
		account.GET("", accountAPI.ListAccountHandler())
		account.POST("", requireAuthMdw, csrfValidate, accountAPI.CreateAccountHandler())
		account.PATCH("/:id", requireAuthMdw, csrfValidate, accountAPI.UpdateAccountHandler())
		account.DELETE("/:id", requireAuthMdw, csrfValidate, accountAPI.DeleteAccountHandler())
		account.GET("/:id", accountAPI.GetAccountHandler())
	}

	orders := v1.Group("/orders", requireAuthMdw, identifyMdw)
	{
		orders.POST("", csrfValidate, orderAPI.CreateOrderHandler())
		orders.GET("", orderAPI.ListOrderHandler())
		orders.GET("/:id", orderAPI.GetOrderHandler())
		orders.PATCH("/:id", csrfValidate, orderAPI.UpdateOrderStatusHandler())
	}
}

func setupAdminRoute(serviceCtx sctx.ServiceContext, router *gin.Engine) {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	authBusiness := authBusiness.NewBusiness(nil, nil, serviceCtx.MustGet(common.KeyCompJWT).(common.JWTProvider), nil, nil)
	userRepo := userRepository.NewMySQLRepository(db.GetDB())
	requireAuthMdw := middleware.RequireAuth(authBusiness)
	requireAdminMdw := middleware.RequireAdmin(userRepo)

	adminAPI := composer.ComposeAdminAPIService(serviceCtx)
	uploadAPI := composer.ComposeUploadAPIService(serviceCtx)

	v1Admin := router.Group("/v1", middleware.RateLimitMiddleware(10, 100))

	admin := v1Admin.Group("/admin", requireAuthMdw, requireAdminMdw)
	{
		admin.GET("/stats", adminAPI.GetStatsHandler())
		admin.POST("/upload/presign", uploadAPI.GeneratePresignedURLHandler())
	}

}

func Execute() {
	serviceCtx := newServiceCtx()

	if err := serviceCtx.Load(); err != nil {
		log.Fatalln(err)
	}
	defer serviceCtx.Stop()

	ginComp := serviceCtx.MustGet(common.KeyCompGIN).(common.GinEngine)
	router := ginComp.GetRouter()

	router.Use(gin.Recovery(), gin.Logger(), sctxMdw.Recovery(serviceCtx))
	router.Use(middleware.Cors())
	router.Use(middleware.SecurityHeaders())

	setupRoute(serviceCtx, router)
	setupAdminRoute(serviceCtx, router)

	s := &http.Server{
		Addr:           fmt.Sprintf(":%d", ginComp.GetPort()),
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	fmt.Printf("Server is running on port %d with Timeouts configured...\n", ginComp.GetPort())

	if err := s.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalln(err)
	}
}
