package composer

import (
	"tradeplay/common"
	"tradeplay/services/user/business"
	"tradeplay/services/user/repository/mysql"
	"tradeplay/services/user/transport/api"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type UserService interface {
	GetUserProfileHandler() func(*gin.Context)
	PatchUserProfileHandler() func(*gin.Context)
}

func ComposeUserAPIService(serviceCtx sctx.ServiceContext) UserService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)

	useRepo := mysql.NewMySQLRepository(db.GetDB())
	biz := business.NewUserBusiness(useRepo)
	userService := api.NewUserAPI(biz)

	return userService
}
