package api

import (
	"context"
	sctx "tradeplay/components/service-context"
	"tradeplay/services/auth/entity"
)

type Business interface {
	Authenticate(ctx context.Context, data *entity.AuthEmailPasswordDTO, userAgent, ipAddress string) (*entity.TokenResponse, error)
	Register(ctx context.Context, data *entity.AuthRegisterDTO) error
	VerifyEmail(ctx context.Context, data *entity.VerifyEmailData) error
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, data *entity.ResetPasswordData) error
	LoginWithGoogle(ctx context.Context, code, userAgent, ipAddress string) (*entity.TokenResponse, error)
	RefreshToken(ctx context.Context, refreshToken, userAgent, ipAddress string) (*entity.TokenResponse, error)
	Logout(ctx context.Context, refreshToken string) error
	ChangePassword(ctx context.Context, userID int32, data *entity.ChangePasswordDTO) error
}

type api struct {
	serviceCtx sctx.ServiceContext
	business   Business
}

func NewAuthAPI(serviceCtx sctx.ServiceContext, business Business) *api {
	return &api{
		serviceCtx: serviceCtx,
		business:   business,
	}
}
