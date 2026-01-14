package api

import (
	"context"
	"errors"
	"net/http"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) GetOrderHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		uidStr := c.Param("id")
		uid, err := core.FromBase58(uidStr)
		if err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}
		id := int(uid.GetLocalID())

		requester, exists := c.Get(core.KeyRequester)
		if !exists {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(errors.New("unthorized")))
			return
		}
		ctx := context.WithValue(c.Request.Context(), core.KeyRequester, requester)

		data, err := api.business.GetOrder(ctx, id)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(data))
	}
}
