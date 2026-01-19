package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) CreateOrderHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var data entity.OrderCreate
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(core.KeyRequester).(core.Requester)
		uid, _ := core.FromBase58(requester.GetSubject())
		userId := int(uid.GetLocalID())

		ipAddress := c.ClientIP()

		// SỬA: Truyền &data vào
		newOrder, err := api.business.CreateOrder(c.Request.Context(), userId, &data, ipAddress)

		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(newOrder))
	}
}
