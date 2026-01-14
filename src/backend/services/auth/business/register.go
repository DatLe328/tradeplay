package business

import (
	"context"
	"fmt"
	"time"
	"tradeplay/common"
	"tradeplay/services/auth/entity"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) Register(ctx context.Context, data *authEntity.AuthRegister) error {
	if err := data.Validate(); err != nil {
		return core.ErrInvalidRequest(err)
	}

	auth, err := biz.authRepository.GetAuth(ctx, data.Email)

	if err == nil {
		if auth.Status != authEntity.AuthStatusInactive {
			return core.ErrInvalidRequest(authEntity.ErrEmailHasExisted)
		}

		salt, err := core.GenSalt(16)
		if err != nil {
			return core.ErrInternal(err)
		}
		hashedPassword, err := biz.hasher.HashPassword(salt, data.Password)
		if err != nil {
			return core.ErrInternal(err)
		}

		auth.Password = &hashedPassword
		auth.Salt = &salt

		if err := biz.authRepository.UpdateAuth(ctx, auth); err != nil {
			return core.ErrInternal(err)
		}
	} else {
		dto := userEntity.NewUserForCreation(data.FirstName, data.LastName)
		userId, err := biz.userRepository.CreateUser(ctx, dto)
		if err != nil {
			return core.ErrInternal(err)
		}

		salt, err := core.GenSalt(16)
		if err != nil {
			return core.ErrInternal(err)
		}

		hashedPassword, err := biz.hasher.HashPassword(salt, data.Password)
		if err != nil {
			return core.ErrInternal(err)
		}

		newAuth := authEntity.NewAuthWithEmailPassword(userId, data.Email, hashedPassword, salt)
		newAuth.Status = authEntity.AuthStatusInactive

		if err := biz.authRepository.AddAuth(ctx, newAuth); err != nil {
			return core.ErrInternal(err)
		}
	}

	otp, err := common.GenOTP(6)
	if err != nil {
		return core.ErrInternal(err)
	}

	verifyCode := &authEntity.VerifyCode{
		SQLModel:  core.NewSQLModel(),
		Email:     data.Email,
		Code:      otp,
		Type:      entity.RegisterVerify,
		ExpiredAt: time.Now().Add(15 * time.Minute),
	}

	if err := biz.authRepository.CreateVerifyCode(ctx, verifyCode); err != nil {
		return core.ErrInternal(err)
	}

	go func() {
		subject := "Mã xác thực tài khoản TradePlay"
		content := fmt.Sprintf("<h1>Xin chào,</h1><p>Mã xác thực của bạn là: <b style='font-size: 20px'>%s</b></p><p>Mã có hiệu lực trong 15 phút.</p>", otp)
		_ = biz.emailProvider.SendEmail([]string{data.Email}, subject, content)
	}()

	return nil
}
