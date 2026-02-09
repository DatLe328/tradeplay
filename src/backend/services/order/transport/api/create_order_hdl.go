package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/order/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) CreateOrderHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var data entity.OrderCreate
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userId := int(uid.GetLocalID())

		ipAddress := c.ClientIP()

		newOrder, err := api.business.CreateOrder(c.Request.Context(), int32(userId), &data, ipAddress)

		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(newOrder))
	}
}
