package composer

import (
	"tradeplay/common"
	"tradeplay/services/user/business"
	"tradeplay/services/user/repository/mysql"
	"tradeplay/services/user/transport/api"

	sctx "tradeplay/components/service-context"

	"github.com/gin-gonic/gin"
)

type UserService interface {
	GetUserProfileHandler() gin.HandlerFunc
	PatchUserProfileHandler() gin.HandlerFunc
}

func ComposeUserAPIService(serviceCtx sctx.ServiceContext) UserService {
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent)

	userRepository := mysql.NewMySQLRepository(db.GetDB())

	userBusiness := business.NewUserBusiness(userRepository)

	userService := api.NewUserAPI(userBusiness)

	return userService
}
