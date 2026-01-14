package mocks

import (
	"context"

	"github.com/golang-jwt/jwt/v5"
)

type JWTProviderMock struct {
	IssueTokenFn func(
		ctx context.Context,
		tid, sub string,
		seconds int,
	) (string, int, error)

	ParseTokenFn func(
		ctx context.Context,
		token string,
	) (*jwt.RegisteredClaims, error)
}

func (m *JWTProviderMock) IssueToken(
	ctx context.Context,
	tid, sub string,
	seconds int,
) (string, int, error) {
	return m.IssueTokenFn(ctx, tid, sub, seconds)
}

func (m *JWTProviderMock) ParseToken(
	ctx context.Context,
	token string,
) (*jwt.RegisteredClaims, error) {
	return m.ParseTokenFn(ctx, token)
}
