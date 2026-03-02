package composer

import (
	"tradeplay/common"
	"tradeplay/components/gormc"
	accountRepo "tradeplay/services/account/repository/mysql"
	auditRepo "tradeplay/services/audit/repository/mysql"
	notificationMysql "tradeplay/services/notification/repository/mysql"
	orderRepo "tradeplay/services/order/repository/mysql"
	"tradeplay/services/payment/business"
	paymentRepo "tradeplay/services/payment/repository/mysql"
	"tradeplay/services/payment/transport/api"
	walletRepo "tradeplay/services/wallet/repository/mysql"

	accountBusiness "tradeplay/services/account/business"
	orderBusiness "tradeplay/services/order/business"
	walletBusiness "tradeplay/services/wallet/business"

	sctx "tradeplay/pkg/service-context"

	"github.com/gin-gonic/gin"
)

type PaymentService interface {
	HandleSepayWebhook(c *gin.Context)
}

func ComposePaymentAPIService(serviceCtx sctx.ServiceContext) PaymentService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(gormc.DBComponent)
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.StreamBroker)
	configComp := serviceCtx.MustGet(common.KeyCompConf).(common.AppConfig)

	orderRepository := orderRepo.NewMySQLRepository(db.GetDB())
	walletRepository := walletRepo.NewMySQLRepository(db.GetDB())
	accountRepository := accountRepo.NewMySQLRepository(db.GetDB())
	auditRepository := auditRepo.NewMySQLRepository(db.GetDB(), redisComp)
	paymentRepository := paymentRepo.NewPaymentWebhookRepository(db.GetDB())

	// Notification repository (need both reader and writer)
	notificationReader := notificationMysql.NewNotificationReader(db.GetDB())
	notificationWriter := notificationMysql.NewNotificationWriter(db.GetDB())

	accountBusiness := accountBusiness.NewAccountBusiness(
		accountRepository,
		nil,
		nil,
		"",
		auditRepository,
	)

	walletBusiness := walletBusiness.NewWalletBusiness(
		walletRepository,
		auditRepository,
	)

	orderBiz := orderBusiness.NewOrderBusiness(orderRepository, accountBusiness, walletBusiness, auditRepository)

	// Create composite notification repository
	notificationRepo := &compositeNotificationRepository{
		reader: notificationReader,
		writer: notificationWriter,
	}

	biz := business.NewBusiness(
		paymentRepository,
		orderBiz,
		walletBusiness,
		auditRepository,
		notificationRepo,
		configComp.SepayAPIKey(),
	)

	return api.NewPaymentHandler(serviceCtx, biz)
}
