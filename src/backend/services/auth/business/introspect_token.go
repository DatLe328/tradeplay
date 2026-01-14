package business

import (
	"context"

	"github.com/DatLe328/service-context/core"
	"github.com/golang-jwt/jwt/v5"
)

func (biz *business) IntrospectToken(ctx context.Context, accessToken string) (*jwt.RegisteredClaims, error) {
	claims, err := biz.jwtProvider.ParseToken(ctx, accessToken)

	if err != nil {
		return nil, core.ErrInvalidToken(err)
	}

	return claims, nil
}
