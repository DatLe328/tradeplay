package composer

import (
	"tradeplay/common"
	walletBiz "tradeplay/services/wallet/business"
	walletRepo "tradeplay/services/wallet/repository/mysql"
	walletAPI "tradeplay/services/wallet/transport/api"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type WalletAPIService interface {
	GetMeHandler() gin.HandlerFunc
}

func ComposeWalletAPIService(serviceCtx sctx.ServiceContext) WalletAPIService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)

	repo := walletRepo.NewMySQLRepository(db.GetDB())
	biz := walletBiz.NewBusiness(repo)
	api := walletAPI.NewWalletAPI(biz)

	return api
}
