package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/order/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) FindOrdersAdminHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var paging common.Paging
		if err := c.ShouldBindQuery(&paging); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}
		paging.Process()

		var filter entity.OrderFilter
		if err := c.ShouldBindQuery(&filter); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userId := int(uid.GetLocalID())

		result, err := api.business.FindOrdersAdmin(c.Request.Context(), int32(userId), &filter, &paging)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.SuccessResponse(result, paging, filter))
	}
}
