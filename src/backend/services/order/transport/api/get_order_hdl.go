package api

import (
	"context"
	"errors"
	"net/http"
	"tradeplay/common"
	ginc "tradeplay/components/ginc"

	"github.com/gin-gonic/gin"
)

func (api *api) GetOrderHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		uidStr := c.Param("id")
		uid, err := common.FromBase58(uidStr)
		if err != nil {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}
		id := int(uid.GetLocalID())

		requester, exists := c.Get(common.KeyRequester)
		if !exists {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(errors.New("unthorized")))
			return
		}
		ctx := context.WithValue(c.Request.Context(), common.KeyRequester, requester)

		data, err := api.business.GetOrder(ctx, int32(id))
		if err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(data))
	}
}
