package business

import (
	"context"
	"fmt"
	"time"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	"tradeplay/services/auth/entity"
)

func (biz *business) VerifyEmail(ctx context.Context, data *entity.VerifyEmailData) error {
	logVerify := func(success bool, msg string) {
		action := common.ActionVerifyEmailFailed
		code := 400
		if success {
			action = common.ActionVerifyEmailSuccess
			code = 200
		}
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			Action:     action,
			Payload:    auditEntity.JSONMap{"email": data.Email, "code": data.Code},
			StatusCode: code,
			ErrorMsg:   msg,
			Method:     "POST",
			Path:       "/auth/verify",
		})
	}
	verifyEntry, err := biz.authRepository.GetAvailableVerifyCode(ctx, data.Email, data.Code, entity.RegisterVerify)

	if err != nil {
		logVerify(false, fmt.Sprintf("Invalid or used verify code: %v", err))
		return common.ErrInvalidRequest(entity.ErrVerifyCodeInvalid)
	}

	if verifyEntry.ExpiredAt.Before(time.Now()) {
		logVerify(false, "Verify code expired")
		return common.ErrInvalidRequest(entity.ErrVerifyCodeExpired)
	}

	if err := biz.authRepository.UpdateAuthStatus(ctx, data.Email, entity.AuthStatusVerified); err != nil {
		return common.ErrInternal(err)
	}

	authData, err := biz.authRepository.GetAuthByEmail(ctx, data.Email)
	if err != nil {
		return common.ErrInternal(err)
	}

	if err := biz.authRepository.VerifyUserTransaction(ctx, data.Email, authData.UserID); err != nil {
		return common.ErrInternal(err)
	}

	if err := biz.authRepository.MarkCodeAsUsed(ctx, verifyEntry.ID); err != nil {
		logVerify(false, fmt.Sprintf("Failed to mark code as used: %v", err))
	}
	logVerify(true, "")

	return nil
}
