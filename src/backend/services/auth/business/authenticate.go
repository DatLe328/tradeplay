package business

import (
	"context"
	"errors"
	"time"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/google/uuid"
)

func (biz *business) Authenticate(
	ctx context.Context,
	data *entity.AuthEmailPassword,
) (*entity.TokenResponse, error) {
	authData, err := biz.authRepository.GetAuth(ctx, data.Email)

	if err != nil {
		return nil, core.ErrInvalidRequest(entity.ErrLoginFailed)
	}

	if authData.Status == entity.AuthStatusBanned {
		return nil, core.ErrAccountLocked(errors.New("account has been banned"))
	}

	if authData.Status == entity.AuthStatusInactive {
		return nil, core.ErrInvalidRequest(errors.New("account hasn't verified"))
	}

	if authData.Password == nil || authData.Salt == nil {
		return nil, core.ErrInvalidRequest(entity.ErrLoginFailed)
	}

	if !biz.hasher.CompareHashPassword(*authData.Password, *authData.Salt, data.Password) {
		return nil, core.ErrInvalidRequest(entity.ErrLoginFailed)
	}

	uid := core.NewUID(uint32(authData.UserID), 1, 1)
	sub := uid.String()

	accessTid := uuid.New().String()
	accessToken, accessExp, err := biz.jwtProvider.IssueToken(ctx, accessTid, sub, 0)
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	refreshTid := uuid.New().String()
	refreshToken, refreshExp, err := biz.jwtProvider.IssueToken(ctx, refreshTid, sub, 2592000)
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	err = biz.authRepository.CreateUserToken(ctx, &entity.UserToken{
		UserId:    int(authData.UserID),
		TokenId:   refreshTid,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Second * time.Duration(refreshExp)),
		IsRevoked: false,
	})
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	return &entity.TokenResponse{
		AccessToken: entity.Token{
			Token:     accessToken,
			ExpiredIn: accessExp,
		},
		RefreshToken: &entity.Token{
			Token:     refreshToken,
			ExpiredIn: refreshExp,
		},
	}, nil
}
