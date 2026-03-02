package composer

import (
	"tradeplay/common"
	"tradeplay/components/gormc"
	auditRepo "tradeplay/services/audit/repository/mysql"
	walletBiz "tradeplay/services/wallet/business"
	walletRepo "tradeplay/services/wallet/repository/mysql"
	walletAPI "tradeplay/services/wallet/transport/api"

	sctx "tradeplay/pkg/service-context"

	"github.com/gin-gonic/gin"
)

type WalletAPIService interface {
	GetMeHandler() gin.HandlerFunc
}

func ComposeWalletAPIService(serviceCtx sctx.ServiceContext) WalletAPIService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(gormc.DBComponent)

	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.StreamBroker)

	walletRepository := walletRepo.NewMySQLRepository(db.GetDB())
	auditRepository := auditRepo.NewMySQLRepository(db.GetDB(), redisComp)

	walletBusiness := walletBiz.NewWalletBusiness(walletRepository, auditRepository)

	api := walletAPI.NewWalletAPI(walletBusiness)

	return api
}
