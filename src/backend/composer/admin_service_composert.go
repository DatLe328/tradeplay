package composer

import (
	"tradeplay/common"
	"tradeplay/services/admin/business"
	"tradeplay/services/admin/repository/mysql"
	"tradeplay/services/admin/transport/api"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type AdminService interface {
	GetStatsHandler() func(*gin.Context)
}

func ComposeAdminAPIService(serviceCtx sctx.ServiceContext) AdminService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)

	adminRepo := mysql.NewMySQLRepository(db.GetDB())
	biz := business.NewAdminBusiness(adminRepo)
	adminService := api.NewAdminAPI(biz)

	return adminService
}
