package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/components/emailc"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"
)

type Hasher interface {
	HashPassword(salt, password string) (string, error)
	CompareHashPassword(hashedPassword, salt, password string) bool
}

type AuthRepository interface {
	AddAuth(ctx context.Context, data *authEntity.Auth) error
	GetAuth(ctx context.Context, email string) (*authEntity.Auth, error)
	FindAuthByUserID(ctx context.Context, userId int) (*authEntity.Auth, error)
	CreateVerifyCode(ctx context.Context, data *authEntity.VerifyCode) error
	FindVerifyCode(ctx context.Context, email, code, typeCode string) (*authEntity.VerifyCode, error)
	UpdateAuthStatus(ctx context.Context, email string, status authEntity.AuthStatus) error
	UpdateAuth(ctx context.Context, data *authEntity.Auth) error
	DeleteVerifyCode(ctx context.Context, id int) error

	CreateUserAndAuthGoogle(ctx context.Context, user *userEntity.User, auth *authEntity.Auth) error

	FindAuthByGoogleIDOrEmail(ctx context.Context, googleID, email string) (*authEntity.Auth, error)
	UpdateAuthGoogleID(ctx context.Context, id int, googleID string) error

	CreateUserToken(ctx context.Context, data *authEntity.UserToken) error
	FindUserToken(ctx context.Context, tokenID string) (*authEntity.UserToken, error)
	DeleteUserToken(ctx context.Context, tokenID string) error
	DeleteExpiredTokens(ctx context.Context, userId int) error
}

type UserRepository interface {
	CreateUser(ctx context.Context, data *userEntity.UserDataCreation) (newId int, err error)
	GetUserByID(ctx context.Context, id int) (*userEntity.User, error)
}

type business struct {
	authRepository AuthRepository
	userRepository UserRepository
	jwtProvider    common.JWTProvider
	hasher         Hasher
	emailProvider  emailc.EmailProvider
}

func NewBusiness(
	authRepository AuthRepository,
	userRepository UserRepository,
	jwtProvider common.JWTProvider,
	hasher Hasher,
	emailProvider emailc.EmailProvider,
) *business {
	return &business{
		authRepository: authRepository,
		userRepository: userRepository,
		jwtProvider:    jwtProvider,
		hasher:         hasher,
		emailProvider:  emailProvider,
	}
}
