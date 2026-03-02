package business

import (
	"context"
	"errors"
	"time"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/google/uuid"
)

func (biz *business) RefreshToken(ctx context.Context, refreshToken, userAgent, ipAddress string) (*entity.TokenResponse, error) {
	claims, err := biz.jwtProvider.ParseToken(ctx, refreshToken)
	if err != nil {
		return nil, common.ErrUnauthorized(errors.New("invalid refresh token"), "invalid refresh token")
	}

	res, _ := biz.redis.Get(ctx, "revoked:"+claims.ID)
	if res == "1" {
		uid, _ := common.FromBase58(claims.Subject)
		_ = biz.authRepository.RevokeAllUserTokens(ctx, int32(uid.GetLocalID()))
		return nil, common.ErrUnauthorized(errors.New("security alert"), "token reused, security alert")
	}

	storedToken, err := biz.authRepository.GetUserToken(ctx, claims.ID)
	if err != nil {
		return nil, common.ErrUnauthorized(errors.New("token not found"), "token expired or not found")
	}

	uid, _ := common.FromBase58(claims.Subject)
	userId := int32(uid.GetLocalID())

	if storedToken.IsRevoked {
		_ = biz.authRepository.RevokeAllUserTokens(ctx, userId)
		biz.redis.Set(ctx, "revoked:"+claims.ID, "1", time.Hour*24)
		return nil, common.ErrUnauthorized(errors.New("security alert"), "suspicious activity detected, please login again")
	}

	if err := biz.authRepository.RevokeUserToken(ctx, storedToken.TokenId); err != nil {
		return nil, common.ErrInternal(err)
	}

	ttl := time.Until(claims.ExpiresAt)
	if ttl > 0 {
		biz.redis.Set(ctx, "revoked:"+claims.ID, "1", ttl)
	}

	newAccessTid := uuid.New().String()
	newAccessToken, newExp, err := biz.jwtProvider.IssueToken(ctx, newAccessTid, claims.Subject, 3600)

	newRefreshTid := uuid.New().String()
	newRefreshToken, newRefreshExp, err := biz.jwtProvider.IssueToken(ctx, newRefreshTid, claims.Subject, 2592000)

	err = biz.authRepository.CreateUserToken(ctx, &entity.UserToken{
		UserId:    userId,
		TokenId:   newRefreshTid,
		Token:     newRefreshToken,
		ExpiresAt: time.Now().Add(time.Second * time.Duration(newRefreshExp)),
		IsRevoked: false,
		UserAgent: userAgent,
		IpAddress: ipAddress,
	})

	go func() {
		_ = biz.authRepository.DeleteExpiredTokens(context.Background(), userId)
	}()

	return &entity.TokenResponse{
		AccessToken:  entity.Token{Token: newAccessToken, ExpiredIn: newExp},
		RefreshToken: &entity.Token{Token: newRefreshToken, ExpiredIn: newRefreshExp},
	}, nil
}

func (biz *business) IsTokenRevoked(ctx context.Context, tokenID string) bool {
	res, err := biz.redis.Get(ctx, "revoked:"+tokenID)
	if err == nil && res == "1" {
		return true
	}
	return false
}
