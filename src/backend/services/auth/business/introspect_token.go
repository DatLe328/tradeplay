package business

import (
	"context"
	"tradeplay/common"
)

func (biz *business) IntrospectToken(ctx context.Context, accessToken string) (*common.TokenClaims, error) {
	claims, err := biz.jwtProvider.ParseToken(ctx, accessToken)

	if err != nil {
		return nil, common.ErrInvalidToken(err)
	}

	return claims, nil
}
