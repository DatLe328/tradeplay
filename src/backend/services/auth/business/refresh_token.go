package business

import (
	"context"
	"errors"
	"log"
	"time"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/google/uuid"
)

func (biz *business) RefreshToken(ctx context.Context, refreshToken string) (*entity.TokenResponse, error) {
	claims, err := biz.jwtProvider.ParseToken(ctx, refreshToken)
	if err != nil {
		return nil, core.ErrUnauthorized(errors.New("invalid refresh token"), "invalid refresh token", "unauthorized")
	}

	storedToken, err := biz.authRepository.FindUserToken(ctx, claims.ID)
	if err != nil {
		return nil, core.ErrUnauthorized(errors.New("token not found or expired"), "token not found or expired", "unauthorized")
	}

	if storedToken.IsRevoked {
		return nil, core.ErrUnauthorized(errors.New("token has been revoked"), "token has been revoked", "unauthorized")
	}

	uid, _ := core.FromBase58(claims.Subject)
	userId := int(uid.GetLocalID())

	if err := biz.authRepository.DeleteUserToken(ctx, storedToken.TokenId); err != nil {
		return nil, core.ErrInternal(err)
	}

	go func() {
		log.Println("Starting cleanup of expired tokens for user ID:", userId)
		_ = biz.authRepository.DeleteExpiredTokens(context.Background(), userId)
	}()

	newAccessTid := uuid.New().String()
	sub := claims.Subject
	newAccessToken, newExp, err := biz.jwtProvider.IssueToken(ctx, newAccessTid, sub, 60)
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	newRefreshTid := uuid.New().String()
	newRefreshToken, newRefreshExp, err := biz.jwtProvider.IssueToken(ctx, newRefreshTid, sub, 2592000)
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	err = biz.authRepository.CreateUserToken(ctx, &entity.UserToken{
		UserId:    userId,
		TokenId:   newRefreshTid,
		Token:     newRefreshToken,
		ExpiresAt: time.Now().Add(time.Second * time.Duration(newRefreshExp)),
		IsRevoked: false,
	})
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	return &entity.TokenResponse{
		AccessToken: entity.Token{
			Token:     newAccessToken,
			ExpiredIn: newExp,
		},
		RefreshToken: &entity.Token{
			Token:     newRefreshToken,
			ExpiredIn: newRefreshExp,
		},
	}, nil
}
