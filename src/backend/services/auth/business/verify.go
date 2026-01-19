package business

import (
	"context"
	"errors"
	"log"
	"time"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) VerifyEmail(ctx context.Context, data *entity.VerifyEmailData) error {
	verifyEntry, err := biz.authRepository.FindAvailableVerifyCode(ctx, data.Email, data.Code, entity.RegisterVerify)

	if err != nil {
		return core.ErrInvalidRequest(errors.New("mã xác thực không hợp lệ hoặc đã được sử dụng"))
	}

	if verifyEntry.ExpiredAt.Before(time.Now()) {
		return core.ErrInvalidRequest(errors.New("mã xác thực đã hết hạn, vui lòng yêu cầu mã mới"))
	}

	if err := biz.authRepository.UpdateAuthStatus(ctx, data.Email, entity.AuthStatusVerified); err != nil {
		return core.ErrInternal(err)
	}

	if err := biz.authRepository.MarkCodeAsUsed(ctx, verifyEntry.Id); err != nil {
		log.Printf("Failed to mark code as used: %v", err)
	}

	return nil
}
