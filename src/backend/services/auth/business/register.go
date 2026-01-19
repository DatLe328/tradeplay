package business

import (
	"context"
	"fmt"
	"log"
	"time"
	"tradeplay/common"
	"tradeplay/services/auth/entity"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) Register(ctx context.Context, data *authEntity.AuthRegister) error {
	if err := data.Validate(); err != nil {
		return core.ErrInvalidRequest(err)
	}

	salt, err := core.GenSalt(common.DefaultSaltLength)
	if err != nil {
		return core.ErrInternal(err)
	}
	hashedPassword, err := biz.hasher.HashPassword(salt, data.Password)
	if err != nil {
		return core.ErrInternal(err)
	}

	authEmail, err := biz.authRepository.FindAuthByEmailAndType(ctx, data.Email, entity.AuthTypeEmailPassword)

	if err == nil && authEmail != nil {
		if authEmail.Status == authEntity.AuthStatusVerified || authEmail.Status == authEntity.AuthStatusSuspended {
			return core.ErrInvalidRequest(authEntity.ErrEmailHasExisted)
		}

		authEmail.Password = &hashedPassword
		authEmail.Salt = &salt
		if err := biz.authRepository.UpdateAuth(ctx, authEmail); err != nil {
			return core.ErrInternal(err)
		}

	} else {

		var userId int

		authGoogle, errG := biz.authRepository.FindAuthByEmailAndType(ctx, data.Email, entity.AuthTypeGoogle)

		if errG == nil && authGoogle != nil {
			userId = int(authGoogle.UserID)
		} else {
			dto := userEntity.NewUserCreation(data.FirstName, data.LastName)
			newUserId, err := biz.userRepository.CreateUser(ctx, dto)
			if err != nil {
				return core.ErrInternal(err)
			}
			userId = newUserId

			// Tạo Wallet
			const DefaultCurrency = "VND"
			newWallet := &walletEntity.Wallet{
				UserId:   userId,
				Balance:  0,
				Currency: DefaultCurrency,
			}
			if errCreate := biz.walletRepository.CreateWallet(ctx, newWallet); errCreate != nil {
				log.Printf("[WARNING] Register: Failed to create wallet for user %d: %v\n", userId, errCreate)
			}
		}

		newAuth := authEntity.NewAuthWithEmailPassword(userId, data.Email, hashedPassword, salt)
		newAuth.Status = authEntity.AuthStatusUnverified

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
