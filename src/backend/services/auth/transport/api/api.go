package api

import (
	"context"
	"tradeplay/services/auth/entity"

	sctx "github.com/DatLe328/service-context"
)

type Business interface {
	Authenticate(ctx context.Context, data *entity.AuthEmailPassword, userAgent, ipAddress string) (*entity.TokenResponse, error)
	Register(ctx context.Context, data *entity.AuthRegister) error
	VerifyEmail(ctx context.Context, data *entity.VerifyEmailData) error
	UpdateAuthStatus(ctx context.Context, email string, status entity.AuthStatus) error
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, data *entity.ResetPasswordData) error
	LoginWithGoogle(ctx context.Context, code, userAgent, ipAddress string) (*entity.TokenResponse, error)
	RefreshToken(ctx context.Context, refreshToken, userAgent, ipAddress string) (*entity.TokenResponse, error)
	Logout(ctx context.Context, refreshToken string) error
	ChangePassword(ctx context.Context, userId int, data *entity.ChangePasswordRequest) error
}

type api struct {
	serviceCtx sctx.ServiceContext
	business   Business
}

func NewAPI(serviceCtx sctx.ServiceContext, business Business) *api {
	return &api{
		serviceCtx: serviceCtx,
		business:   business,
	}
}
