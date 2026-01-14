package composer

import (
	"tradeplay/common"
	accountRepo "tradeplay/services/account/repository/mysql"
	"tradeplay/services/order/business"
	orderRepo "tradeplay/services/order/repository/mysql"
	"tradeplay/services/order/transport/api"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type OrderService interface {
	CreateOrderHandler() func(*gin.Context)
	ListOrderHandler() func(*gin.Context)
	GetOrderHandler() func(*gin.Context)
	UpdateOrderStatusHandler() func(*gin.Context)
}

func ComposeOrderAPIService(serviceCtx sctx.ServiceContext) OrderService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent).GetDB()

	accRepo := accountRepo.NewMySQLRepository(db)
	ordRepo := orderRepo.NewMySQLRepository(db)
	biz := business.NewBusiness(ordRepo, accRepo)

	serviceAPI := api.NewOrderAPI(biz)

	return serviceAPI
}
