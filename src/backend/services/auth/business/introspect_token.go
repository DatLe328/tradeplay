package business

import (
	"context"
	"tradeplay/common"

	"github.com/golang-jwt/jwt/v5"
)

func (biz *business) IntrospectToken(ctx context.Context, accessToken string) (*jwt.RegisteredClaims, error) {
	claims, err := biz.jwtProvider.ParseToken(ctx, accessToken)

	if err != nil {
		return nil, common.ErrInvalidToken(err)
	}

	return claims, nil
}
