package composer

import (
	"context"
	"fmt"
	"log"
	"tradeplay/common"

	sctx "tradeplay/components/service-context"
)

func RunNotificationWorker(serviceCtx sctx.ServiceContext) {
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)
	emailProv := serviceCtx.MustGet(common.KeyCompEmail).(common.EmailComponent)

	ctx := context.Background()

	redisComp.Consume(ctx, "notification_stream", "email_group", "worker-1", func(data map[string]interface{}) error {
		email := data["email"].(string)
		otp := data["otp_code"].(string)
		subject := data["subject"].(string)

		content := fmt.Sprintf("<h1>Xin chào,</h1><p>Mã xác thực là: <b>%s</b></p>", otp)

		if err := emailProv.SendEmail([]string{email}, subject, content); err != nil {
			log.Printf("[ERROR] Worker failed to send email to %s: %v", email, err)
			return err
		}

		log.Printf("[INFO] Worker sent OTP email successfully to %s", email)
		return nil
	})
}
