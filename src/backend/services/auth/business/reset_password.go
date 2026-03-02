package business

import (
	"context"
	"fmt"
	"time"
	"tradeplay/common"
	crypto "tradeplay/pkg/crypto"
	auditEntity "tradeplay/services/audit/entity"
	"tradeplay/services/auth/entity"
)

func (biz *business) ResetPassword(ctx context.Context, data *entity.ResetPasswordData) error {
	logReset := func(success bool, msg string) {
		action := common.ActionResetPassFailed
		code := 400
		if success {
			action = common.ActionResetPassSuccess
			code = 200
		}
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			Action:     action,
			Payload:    auditEntity.JSONMap{"email": data.Email},
			StatusCode: code,
			ErrorMsg:   msg,
			Method:     "POST",
			Path:       "/auth/reset-password",
		})
	}
	verifyEntry, err := biz.authRepository.GetAvailableVerifyCode(ctx, data.Email, data.Code, entity.ForgotPasswordVerify)

	if err != nil {
		return common.ErrInvalidRequest(entity.ErrVerifyCodeInvalid)
	}

	if verifyEntry.ExpiredAt.Before(time.Now()) {
		logReset(false, "Code expired")
		return common.ErrInvalidRequest(entity.ErrVerifyCodeExpired)
	}

	auth, err := biz.authRepository.GetAuthByEmail(ctx, data.Email)
	if err != nil {
		logReset(false, fmt.Sprintf("email not found: %v", err))
		return common.ErrEntityNotFound(auth.TableName(), entity.ErrEmailIsNotValid)
	}

	salt, err := crypto.GenSalt(crypto.DefaultSaltLength)
	if err != nil {
		return common.ErrInternal(err)
	}

	hashedPassword, err := biz.hasher.HashPassword(salt, data.NewPassword)
	if err != nil {
		return common.ErrInternal(err)
	}

	auth.Password = &hashedPassword
	auth.Salt = &salt
	auth.Status = entity.AuthStatusVerified

	if err := biz.authRepository.UpdateAuth(ctx, auth); err != nil {
		return common.ErrInternal(err)
	}

	if err := biz.authRepository.MarkCodeAsUsed(ctx, verifyEntry.ID); err != nil {
		logReset(false, fmt.Sprintf("Failed to mark code as used: %v", err))
	}
	logReset(true, "")

	return nil
}
