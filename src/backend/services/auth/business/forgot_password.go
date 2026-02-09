package business

import (
	"context"
	"fmt"
	"time"
	"tradeplay/common"
	authEntity "tradeplay/services/auth/entity"
)

func (biz *business) ForgotPassword(ctx context.Context, email string) error {
	auth, err := biz.authRepository.GetAuthByEmail(ctx, email)
	if err != nil {
		return common.ErrInvalidRequest(err)
	}

	if auth.Status == authEntity.AuthStatusSuspended {
		return common.ErrInvalidRequest(authEntity.ErrAuthSuspended)
	}

	otp, err := common.GenOTP(6)
	if err != nil {
		return common.ErrInternal(err)
	}

	verifyCode := authEntity.NewVerifyCode(
		email,
		otp,
		authEntity.ForgotPasswordVerify,
		time.Now().Add(5*time.Minute),
	)

	if err := biz.authRepository.CreateVerifyCode(ctx, verifyCode); err != nil {
		return common.ErrInternal(err)
	}

	go func() {
		subject := "Khôi phục mật khẩu TienCoTruong"
		content := fmt.Sprintf("<h1>Yêu cầu đặt lại mật khẩu</h1><p>Mã xác thực của bạn là: <b style='font-size: 20px'>%s</b></p><p>Mã có hiệu lực trong 15 phút. Tuyệt đối không chia sẻ mã này.</p>", otp)
		_ = biz.emailProvider.SendEmail([]string{email}, subject, content)
	}()

	return nil
}
