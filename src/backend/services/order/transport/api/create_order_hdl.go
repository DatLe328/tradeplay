package api

import (
	"net/http"
	"strconv"
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
		realAccountId, err := strconv.Atoi(data.AccountId)

		if err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}
		// realAccountId := common.UnmaskID(tmpId, common.AccountIdOffset)
		requester := c.MustGet(core.KeyRequester).(core.Requester)
		uid, _ := core.FromBase58(requester.GetSubject())
		userId := int(uid.GetLocalID())

		newOrder, err := api.business.CreateOrder(c.Request.Context(), userId, realAccountId)

		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(newOrder))
	}
}
