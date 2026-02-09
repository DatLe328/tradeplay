package business

import (
	"context"
	"log"
	"time"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	"tradeplay/services/auth/entity"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"
)

func (biz *business) Register(ctx context.Context, data *authEntity.AuthRegisterDTO) error {
	if err := data.Validate(); err != nil {
		return common.ErrInvalidRequest(err)
	}

	salt, err := common.GenSalt(common.DefaultSaltLength)
	if err != nil {
		return common.ErrInternal(err)
	}
	hashedPassword, err := biz.hasher.HashPassword(salt, data.Password)
	if err != nil {
		return common.ErrInternal(err)
	}

	authEmail, err := biz.authRepository.GetAuthByEmailAndType(ctx, data.Email, entity.AuthTypeEmailPassword)
	var userID int32

	if err == nil && authEmail != nil {
		if authEmail.Status == authEntity.AuthStatusVerified || authEmail.Status == authEntity.AuthStatusSuspended {
			biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
				Action:     common.ActionRegisterFailed,
				Payload:    auditEntity.JSONMap{"email": data.Email},
				StatusCode: 400,
				ErrorMsg:   "Email already exists",
				Method:     "POST",
				Path:       "/auth/register",
			})
			return common.ErrInvalidRequest(authEntity.ErrEmailHasExisted)
		}

		authEmail.Password = &hashedPassword
		authEmail.Salt = &salt
		if err := biz.authRepository.UpdateAuth(ctx, authEmail); err != nil {
			return common.ErrInternal(err)
		}

	} else {
		authGoogle, errG := biz.authRepository.GetAuthByEmailAndType(ctx, data.Email, entity.AuthTypeGoogle)

		if errG == nil && authGoogle != nil {
			userID = authGoogle.UserID
		} else {
			dto := userEntity.NewUserCreateDTO(data.FirstName, data.LastName)
			newUserId, err := biz.userBusiness.CreateUser(ctx, dto)
			if err != nil {
				return common.ErrInternal(err)
			}
			userID = newUserId

			if errCreate := biz.walletBusiness.CreateWallet(ctx, userID); errCreate != nil {
				biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
					UserId:     userID,
					Action:     common.ActionCreateWalletFailed,
					StatusCode: 500,
					ErrorMsg:   errCreate.Error(),
					Method:     "POST",
				})
				log.Printf("[WARNING] Register: Failed to create wallet for user %d: %v\n", userID, errCreate)
			}
		}

		newAuth := authEntity.NewAuthWithEmailPassword(userID, data.Email, hashedPassword, salt)
		newAuth.Status = authEntity.AuthStatusUnverified

		if err := biz.authRepository.CreateAuth(ctx, newAuth); err != nil {
			return common.ErrInternal(err)
		}
	}

	otp, err := common.GenOTP(6)
	if err != nil {
		return common.ErrInternal(err)
	}

	verifyCode := authEntity.NewVerifyCode(
		data.Email,
		otp,
		authEntity.RegisterVerify,
		time.Now().Add(5*time.Minute),
	)

	if err := biz.authRepository.CreateVerifyCode(ctx, verifyCode); err != nil {
		return common.ErrInternal(err)
	}
	biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
		UserId:     userID,
		Action:     common.ActionRegisterSuccess,
		Payload:    auditEntity.JSONMap{"email": data.Email, "first_name": data.FirstName},
		StatusCode: 201,
		Method:     "POST",
		Path:       "/auth/register",
	})

	notificationPayload := map[string]interface{}{
		"type":      "REGISTER_OTP",
		"email":     data.Email,
		"otp_code":  otp,
		"subject":   "Mã xác thực tài khoản TienCoTruong",
		"timestamp": time.Now().Unix(),
	}

	if err := biz.redis.Produce(ctx, "notification_stream", notificationPayload); err != nil {
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:     userID,
			Action:     common.ActionPushNotificationFailed,
			StatusCode: 500,
			ErrorMsg:   err.Error(),
			Method:     "POST",
		})
		log.Printf("[ERROR] Failed to push notification to Redis Stream: %v", err)
	}

	return nil
}
