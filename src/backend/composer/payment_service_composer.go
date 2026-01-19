package composer

import (
	"tradeplay/common"
	accountRepo "tradeplay/services/account/repository/mysql"
	orderRepo "tradeplay/services/order/repository/mysql"
	"tradeplay/services/payment/business"
	"tradeplay/services/payment/transport/api"
	walletRepo "tradeplay/services/wallet/repository/mysql"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type PaymentService interface {
	HandleSepayWebhook(c *gin.Context)
}

func ComposePaymentAPIService(serviceCtx sctx.ServiceContext) PaymentService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	orderRepository := orderRepo.NewMySQLRepository(db.GetDB())
	walletRepository := walletRepo.NewMySQLRepository(db.GetDB())
	accountRepository := accountRepo.NewMySQLRepository(db.GetDB())

	biz := business.NewBusiness(walletRepository, orderRepository, accountRepository)

	return api.NewPaymentHandler(serviceCtx, biz)
}
