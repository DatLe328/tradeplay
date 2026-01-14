package api

import (
	"net/http"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) GetUserProfileHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		requester := c.MustGet(core.KeyRequester).(core.Requester)
		ctx := core.ContextWithRequester(c.Request.Context(), requester)

		user, err := api.business.GetUserProfile(ctx)

		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		user.Mask()
		c.JSON(http.StatusOK, core.ResponseData(user))
	}
}
