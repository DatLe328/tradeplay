package business

import (
	"context"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	authEntity "tradeplay/services/auth/entity"
)

func (biz *business) ChangePassword(ctx context.Context, userID int32, data *authEntity.ChangePasswordDTO) error {
	if err := data.Validate(); err != nil {
		return common.ErrInvalidRequest(err)
	}
	auth, err := biz.authRepository.GetAuthByUserID(ctx, userID)
	if err != nil {
		return common.ErrInvalidRequest(authEntity.ErrAuthNotFound)
	}

	if auth.Password == nil || auth.Salt == nil {
		return common.ErrInvalidRequest(authEntity.ErrLoginFailed)
	}

	if !biz.hasher.CompareHashPassword(*auth.Password, *auth.Salt, data.OldPassword) {
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:     userID,
			Action:     common.ActionChangePasswordFailed,
			StatusCode: 400,
			ErrorMsg:   "Wrong old password",
			Method:     "POST",
			Path:       "/auth/change-password",
		})
		return common.ErrInvalidRequest(authEntity.ErrPasswordsNotMatch)
	}

	newSalt, err := common.GenSalt(common.DefaultSaltLength)
	if err != nil {
		return common.ErrInternal(err)
	}

	hashedNewPassword, err := biz.hasher.HashPassword(newSalt, data.NewPassword)
	if err != nil {
		return common.ErrInternal(err)
	}

	auth.Password = &hashedNewPassword
	auth.Salt = &newSalt

	if err := biz.authRepository.UpdateAuth(ctx, auth); err != nil {
		return common.ErrInternal(err)
	}
	biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
		UserId:     userID,
		Action:     common.ActionChangePasswordSuccess,
		StatusCode: 200,
		Method:     "POST",
		Path:       "/auth/change-password",
	})

	return nil
}
