package api

import (
	"net/http"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) PatchUserProfileHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		requester := c.MustGet(core.KeyRequester).(core.Requester)
		ctx := core.ContextWithRequester(c.Request.Context(), requester)

		var data entity.UserDataPatch

		if err := c.ShouldBind(&data); err != nil {
			panic(err)
		}

		if err := api.business.PatchUserProfile(ctx, &data); err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
