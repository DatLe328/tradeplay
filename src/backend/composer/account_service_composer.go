package composer

import (
	"tradeplay/common"
	"tradeplay/services/account/business"
	"tradeplay/services/account/repository/mysql"
	"tradeplay/services/account/transport/api"
	auditMysql "tradeplay/services/audit/repository/mysql"
	ordermysql "tradeplay/services/order/repository/mysql"

	sctx "tradeplay/components/service-context"

	"github.com/gin-gonic/gin"
)

type AccountService interface {
	FindAccountsHandler() gin.HandlerFunc
	CreateAccountHandler() gin.HandlerFunc
	UpdateAccountHandler() gin.HandlerFunc
	DeleteAccountHandler() gin.HandlerFunc
	GetAccountHandler() gin.HandlerFunc

	GetAccountCredentialsHandler() gin.HandlerFunc
	AdminGetAccountCredentialsHandler() gin.HandlerFunc
}

func ComposeAccountAPIService(serviceCtx sctx.ServiceContext) AccountService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)
	uploadComp := serviceCtx.MustGet(common.KeyCompUpload).(common.UploadComponent)
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)

	accRepo := mysql.NewMySQLRepository(db.GetDB())
	orderRepo := ordermysql.NewMySQLRepository(db.GetDB())
	auditRepo := auditMysql.NewMySQLRepository(db.GetDB(), redisComp)
	configComp := serviceCtx.MustGet(common.KeyCompConf).(common.ConfigComponent)

	biz := business.NewAccountBusiness(accRepo, orderRepo, uploadComp, configComp.AppSecretKey(), auditRepo)
	accService := api.NewAccountAPI(biz)

	return accService
}
