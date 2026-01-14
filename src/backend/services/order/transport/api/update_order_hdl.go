package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) UpdateOrderStatusHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		uidStr := c.Param("id")
		uid, err := core.FromBase58(uidStr)
		if err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}
		id := int(uid.GetLocalID())

		var data entity.OrderUpdate
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		if err := api.business.UpdateOrderStatus(c.Request.Context(), id, data.Status); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
