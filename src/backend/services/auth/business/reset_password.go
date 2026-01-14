package business

import (
	"context"
	"errors"
	"time"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) ResetPassword(ctx context.Context, data *entity.ResetPasswordData) error {
	verifyEntry, err := biz.authRepository.FindVerifyCode(ctx, data.Email, data.Code, "forgot_password")
	if err != nil {
		return core.ErrInvalidRequest(errors.New("mã xác thực không đúng"))
	}

	if verifyEntry.ExpiredAt.Before(time.Now()) {
		return core.ErrInvalidRequest(errors.New("mã xác thực đã hết hạn"))
	}

	auth, err := biz.authRepository.GetAuth(ctx, data.Email)
	if err != nil {
		return core.ErrEntityNotFound(auth.TableName(), entity.ErrEmailIsNotValid)
	}

	salt, err := core.GenSalt(16)
	if err != nil {
		return core.ErrInternal(err)
	}

	hashedPassword, err := biz.hasher.HashPassword(salt, data.NewPassword)
	if err != nil {
		return core.ErrInternal(err)
	}

	auth.Password = &hashedPassword
	auth.Salt = &salt
	auth.Status = entity.AuthStatusActive

	if err := biz.authRepository.UpdateAuth(ctx, auth); err != nil {
		return core.ErrInternal(err)
	}

	_ = biz.authRepository.DeleteVerifyCode(ctx, verifyEntry.Id)

	return nil
}
