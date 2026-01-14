package business

import (
	"context"
	"errors"
	"time"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) VerifyEmail(ctx context.Context, data *entity.VerifyEmailData) error {
	verifyEntry, err := biz.authRepository.FindVerifyCode(ctx, data.Email, data.Code, "register")

	if err != nil {
		return core.ErrInvalidRequest(errors.New("mã xác thực không chính xác"))
	}

	if verifyEntry.ExpiredAt.Before(time.Now()) {
		return core.ErrInvalidRequest(errors.New("mã xác thực đã hết hạn, vui lòng đăng ký lại"))
	}

	if err := biz.authRepository.UpdateAuthStatus(ctx, data.Email, entity.AuthStatusActive); err != nil {
		return core.ErrInternal(err)
	}
	biz.authRepository.DeleteVerifyCode(ctx, verifyEntry.Id)

	return nil
}
