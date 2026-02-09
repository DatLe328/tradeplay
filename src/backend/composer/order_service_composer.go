package composer

import (
	"tradeplay/common"
	accountBusiness "tradeplay/services/account/business"
	accountRepo "tradeplay/services/account/repository/mysql"
	auditRepo "tradeplay/services/audit/repository/mysql"
	orderBusiness "tradeplay/services/order/business"
	orderRepo "tradeplay/services/order/repository/mysql"
	"tradeplay/services/order/transport/api"
	walletBusiness "tradeplay/services/wallet/business"
	walletRepo "tradeplay/services/wallet/repository/mysql"

	sctx "tradeplay/components/service-context"

	"github.com/gin-gonic/gin"
)

type OrderService interface {
	CreateOrderHandler() gin.HandlerFunc
	FindOrdersHandler() gin.HandlerFunc
	FindOrdersAdminHandler() gin.HandlerFunc
	GetOrderHandler() gin.HandlerFunc
	UpdateOrderStatusHandler() gin.HandlerFunc
}

func ComposeOrderAPIService(serviceCtx sctx.ServiceContext) OrderService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent).GetDB()
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)

	accRepository := accountRepo.NewMySQLRepository(db)
	orderRepository := orderRepo.NewMySQLRepository(db)
	walletRepository := walletRepo.NewMySQLRepository(db)
	auditRepository := auditRepo.NewMySQLRepository(db, redisComp)

	accountBusiness := accountBusiness.NewAccountBusiness(
		accRepository,
		orderRepository,
		nil,
		"",
		auditRepository,
	)
	walletBusiness := walletBusiness.NewWalletBusiness(
		walletRepository,
		auditRepository,
	)
	orderBusiness := orderBusiness.NewOrderBusiness(orderRepository, accountBusiness, walletBusiness, auditRepository)

	serviceAPI := api.NewOrderAPI(orderBusiness)

	return serviceAPI
}
