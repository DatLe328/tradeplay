package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) ChangePasswordHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var data entity.ChangePasswordRequest
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(core.KeyRequester).(core.Requester)

		uid, _ := core.FromBase58(requester.GetSubject())
		userId := int(uid.GetLocalID())

		if err := api.business.ChangePassword(c.Request.Context(), userId, &data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
