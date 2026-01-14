package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) UpdateAuthStatusHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var data entity.UpdateStatusRequest

		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		if data.Status != entity.AuthStatusActive &&
			data.Status != entity.AuthStatusInactive &&
			data.Status != entity.AuthStatusBanned {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(nil))
			return
		}

		email := c.Param("email")

		if err := api.business.UpdateAuthStatus(c.Request.Context(), email, data.Status); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
