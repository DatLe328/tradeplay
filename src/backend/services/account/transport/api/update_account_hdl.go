package api

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"tradeplay/common"
	ginc "tradeplay/components/ginc"
	"tradeplay/services/account/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) UpdateAccountHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		if id < 0 {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(nil))
			return
		}

		var data entity.AccountDataUpdate
		if err := c.ShouldBindJSON(&data); err != nil {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		requester, exists := c.Get(common.KeyRequester)
		if !exists {
			ginc.WriteErrorResponse(c, common.ErrUnauthorized(errors.New("unauthorized"), "unauthorized"))
			return
		}

		ctx := context.WithValue(c.Request.Context(), common.KeyRequester, requester)

		if err := api.business.UpdateAccount(ctx, int32(id), &data); err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}
