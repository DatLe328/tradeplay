package mocks

import (
	"context"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"
)

type AuthRepositoryMock struct {
	GetAuthFn func(ctx context.Context, email string) (*authEntity.Auth, error)
	AddAuthFn func(ctx context.Context, data *authEntity.Auth) error
}

func (m *AuthRepositoryMock) GetAuth(
	ctx context.Context,
	email string,
) (*authEntity.Auth, error) {
	return m.GetAuthFn(ctx, email)
}

func (m *AuthRepositoryMock) AddAuth(
	ctx context.Context,
	data *authEntity.Auth,
) error {
	return m.AddAuthFn(ctx, data)
}

func (m *AuthRepositoryMock) CreateVerifyCode(ctx context.Context, data *authEntity.VerifyCode) error
func (m *AuthRepositoryMock) FindVerifyCode(ctx context.Context, email, code, typeCode string) (*authEntity.VerifyCode, error)
func (m *AuthRepositoryMock) UpdateAuthStatus(ctx context.Context, email string, status authEntity.AuthStatus) error
func (m *AuthRepositoryMock) UpdateAuth(ctx context.Context, data *authEntity.Auth) error
func (m *AuthRepositoryMock) DeleteVerifyCode(ctx context.Context, id int) error
func (m *AuthRepositoryMock) FindAuthByGoogleIDOrEmail(ctx context.Context, googleID, email string) (*authEntity.Auth, error)
func (m *AuthRepositoryMock) UpdateAuthGoogleID(ctx context.Context, id int, googleID string) error
func (m *AuthRepositoryMock) CreateUserAndAuthGoogle(ctx context.Context, user *userEntity.User, auth *authEntity.Auth) error
func (m *AuthRepositoryMock) CreateUserToken(ctx context.Context, data *authEntity.UserToken) error
func (m *AuthRepositoryMock) FindUserToken(ctx context.Context, tokenID string) (*authEntity.UserToken, error)
func (m *AuthRepositoryMock) DeleteUserToken(ctx context.Context, tokenID string) error
func (m *AuthRepositoryMock) FindAuthByUserID(ctx context.Context, userId int) (*authEntity.Auth, error)
func (m *AuthRepositoryMock) DeleteExpiredTokens(ctx context.Context, userId int) error
