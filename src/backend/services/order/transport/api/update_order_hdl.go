package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/order/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) UpdateOrderStatusHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		uidStr := c.Param("id")
		uid, err := common.FromBase58(uidStr)
		if err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}
		id := int(uid.GetLocalID())

		var data entity.OrderUpdate
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)
		requesterUID, _ := common.FromBase58(requester.GetSubject())
		requesterId := int(requesterUID.GetLocalID())

		ipAddress := c.ClientIP()

		if err := api.business.UpdateOrderStatus(c.Request.Context(), int32(id), data.Status, int32(requesterId), ipAddress); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}
