package composer

import (
	"tradeplay/common"
	"tradeplay/components/gormc"
	"tradeplay/services/audit/business"
	auditRepo "tradeplay/services/audit/repository/mysql"
	"tradeplay/services/audit/transport/api"

	sctx "tradeplay/pkg/service-context"

	"github.com/gin-gonic/gin"
)

type AuditService interface {
	ListAuditLogsHandler() gin.HandlerFunc
}

func ComposeAuditAPIService(serviceCtx sctx.ServiceContext) AuditService {
	db := serviceCtx.MustGet("mysql").(gormc.DBComponent)

	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.StreamBroker)
	auditRepository := auditRepo.NewMySQLRepository(db.GetDB(), redisComp)
	biz := business.NewBusiness(auditRepository)

	serviceAPI := api.NewAuditAPI(biz)

	return serviceAPI
}
