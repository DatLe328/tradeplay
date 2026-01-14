package business

import (
	"context"
	"fmt"
	"time"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) ForgotPassword(ctx context.Context, email string) error {
	auth, err := biz.authRepository.GetAuth(ctx, email)
	if err != nil {
		return core.ErrInvalidRequest(err)
	}

	if auth.Status == entity.AuthStatusBanned {
		return core.ErrInvalidRequest(fmt.Errorf("tài khoản đã bị khóa"))
	}

	otp, err := common.GenOTP(6)
	if err != nil {
		return core.ErrInternal(err)
	}

	verifyCode := &entity.VerifyCode{
		SQLModel:  core.NewSQLModel(),
		Email:     email,
		Code:      otp,
		Type:      entity.ForgotPasswordVerify,
		ExpiredAt: time.Now().Add(15 * time.Minute),
	}

	if err := biz.authRepository.CreateVerifyCode(ctx, verifyCode); err != nil {
		return core.ErrInternal(err)
	}

	go func() {
		subject := "Khôi phục mật khẩu TradePlay"
		content := fmt.Sprintf("<h1>Yêu cầu đặt lại mật khẩu</h1><p>Mã xác thực của bạn là: <b style='font-size: 20px'>%s</b></p><p>Mã có hiệu lực trong 15 phút. Tuyệt đối không chia sẻ mã này.</p>", otp)
		_ = biz.emailProvider.SendEmail([]string{email}, subject, content)
	}()

	return nil
}
