package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/user/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) PatchUserProfileHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(common.KeyRequester).(common.Requester)
		ctx := common.ContextWithRequester(c.Request.Context(), requester)

		var data entity.UserUpdateDTO

		if err := c.ShouldBind(&data); err != nil {
			panic(err)
		}

		if err := api.business.PatchUserProfile(ctx, &data); err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}
