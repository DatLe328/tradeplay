package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/components/emailc"
	auditEntity "tradeplay/services/audit/entity"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"
	walletEntity "tradeplay/services/wallet/entity"
)

type hasher interface {
	HashPassword(salt, password string) (string, error)
	CompareHashPassword(hashedPassword, salt, password string) bool
}

type authRepository interface {
	// Auth related methods
	// Reader
	GetAuthByEmail(ctx context.Context, email string) (*authEntity.Auth, error)
	GetAuthByUserID(ctx context.Context, userID int32) (*authEntity.Auth, error)
	GetAuthByGoogleID(ctx context.Context, googleID string) (*authEntity.Auth, error)
	GetAuthByEmailAndType(ctx context.Context, email string, authType authEntity.AuthType) (*authEntity.Auth, error)

	CreateAuth(ctx context.Context, data *authEntity.Auth) error
	CreateUserAndAuthGoogle(ctx context.Context, user *userEntity.User, auth *authEntity.Auth) error
	UpdateAuthStatus(ctx context.Context, email string, status authEntity.AuthStatus) error
	UpdateAuth(ctx context.Context, data *authEntity.Auth) error

	VerifyUserTransaction(ctx context.Context, email string, userID int32) error

	// Token
	CreateUserToken(ctx context.Context, data *authEntity.UserToken) error
	GetUserToken(ctx context.Context, tokenID string) (*authEntity.UserToken, error)
	RevokeUserToken(ctx context.Context, tokenID string) error
	RevokeAllUserTokens(ctx context.Context, userID int32) error
	DeleteUserToken(ctx context.Context, tokenID string) error
	DeleteExpiredTokens(ctx context.Context, userId int32) error

	// Verify Code
	CreateVerifyCode(ctx context.Context, data *authEntity.VerifyCode) error
	GetAvailableVerifyCode(ctx context.Context, email, code string, verifyType authEntity.VerifyType) (*authEntity.VerifyCode, error)
	MarkCodeAsUsed(ctx context.Context, id int32) error
}

type userBusiness interface {
	CreateUser(ctx context.Context, data *userEntity.UserCreateDTO) (newUserID int32, err error)
	GetUserByID(ctx context.Context, id int32) (*userEntity.User, error)
}

type walletBusiness interface {
	CreateWallet(ctx context.Context, userID int32) error
	GetUserWallet(ctx context.Context, userID int32) (*walletEntity.Wallet, error)
}

type auditRepository interface {
	PushAuditLog(ctx context.Context, entry *auditEntity.AuditLog)
}

type business struct {
	authRepository  authRepository
	userBusiness    userBusiness
	walletBusiness  walletBusiness
	auditRepository auditRepository
	jwtProvider     common.TokenProvider
	hasher          hasher
	emailProvider   emailc.EmailProvider
	redis           common.KeyValueStore
	notifier        common.StreamBroker
}

func NewAuthBusiness(
	authRepository authRepository,
	userBusiness userBusiness,
	walletBusiness walletBusiness,
	auditRepository auditRepository,
	jwtProvider common.TokenProvider,
	hasher hasher,
	emailProvider emailc.EmailProvider,
	redis common.KeyValueStore,
	notifier common.StreamBroker,
) *business {
	return &business{
		authRepository:  authRepository,
		userBusiness:    userBusiness,
		walletBusiness:  walletBusiness,
		auditRepository: auditRepository,
		jwtProvider:     jwtProvider,
		hasher:          hasher,
		emailProvider:   emailProvider,
		redis:           redis,
		notifier:        notifier,
	}
}
