package business

import (
	"context"
	"tradeplay/common"
	authEntity "tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) ChangePassword(ctx context.Context, userId int, data *authEntity.ChangePasswordRequest) error {
	if err := data.Validate(); err != nil {
		return core.ErrInvalidRequest(err)
	}
	auth, err := biz.authRepository.FindAuthByUserID(ctx, userId)
	if err != nil {
		return core.ErrInvalidRequest(authEntity.ErrUserNotFound)
	}

	if auth.Password == nil || auth.Salt == nil {
		return core.ErrInvalidRequest(authEntity.ErrLoginFailed)
	}

	if !biz.hasher.CompareHashPassword(*auth.Password, *auth.Salt, data.OldPassword) {
		return core.ErrInvalidRequest(authEntity.ErrPasswordsNotMatch)
	}

	newSalt, err := core.GenSalt(common.DefaultSaltLength)
	if err != nil {
		return core.ErrInternal(err)
	}

	hashedNewPassword, err := biz.hasher.HashPassword(newSalt, data.NewPassword)
	if err != nil {
		return core.ErrInternal(err)
	}

	auth.Password = &hashedNewPassword
	auth.Salt = &newSalt

	if err := biz.authRepository.UpdateAuth(ctx, auth); err != nil {
		return core.ErrInternal(err)
	}

	return nil
}
