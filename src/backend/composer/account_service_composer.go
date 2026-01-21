package composer

import (
	"tradeplay/common"
	"tradeplay/services/account/business"
	"tradeplay/services/account/repository/mysql"
	"tradeplay/services/account/transport/api"
	ordermysql "tradeplay/services/order/repository/mysql"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type AccountService interface {
	ListAccountHandler() func(*gin.Context)
	CreateAccountHandler() func(*gin.Context)
	UpdateAccountHandler() func(*gin.Context)
	DeleteAccountHandler() func(*gin.Context)
	GetAccountHandler() func(*gin.Context)

	GetAccountCredentialsHandler() func(*gin.Context)
}

func ComposeAccountAPIService(serviceCtx sctx.ServiceContext) AccountService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	uploadC := serviceCtx.MustGet(common.KeyCompUpload).(common.UploadComponent)

	accRepo := mysql.NewMySQLRepository(db.GetDB())
	orderRepo := ordermysql.NewMySQLRepository(db.GetDB())
	configComp := serviceCtx.MustGet(common.KeyCompConf).(common.ConfigComponent)

	biz := business.NewAccountBusiness(accRepo, orderRepo, uploadC, configComp.AppSecretKey())
	accService := api.NewAccountAPI(biz)

	return accService
}
