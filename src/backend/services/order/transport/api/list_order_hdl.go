package api

import (
	"context"
	"net/http"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) ListOrderHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var paging core.Paging
		if err := c.ShouldBindQuery(&paging); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}
		paging.Process()

		requester := c.MustGet(core.KeyRequester).(core.Requester)
		uid, _ := core.FromBase58(requester.GetSubject())
		userId := int(uid.GetLocalID())

		isAdmin := c.GetBool(string(common.KeyIsAdmin))
		ctx := context.WithValue(c.Request.Context(), common.KeyIsAdmin, isAdmin)
		result, err := api.business.ListOrders(ctx, userId, &paging)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.SuccessResponse(result, paging, nil))
	}
}
