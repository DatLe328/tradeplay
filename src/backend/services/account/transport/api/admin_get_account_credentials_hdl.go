package api

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"tradeplay/common"
	ginc "tradeplay/components/ginc"

	"github.com/gin-gonic/gin"
)

func (api *api) AdminGetAccountCredentialsHandler() gin.HandlerFunc {
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

		requester, exists := c.Get(common.KeyRequester)
		if !exists {
			ginc.WriteErrorResponse(c, common.ErrUnauthorized(errors.New("unauthorized"), "unauthorized"))
			return
		}

		requesterObj := requester.(common.Requester)

		ctx := context.WithValue(c.Request.Context(), common.KeyRequester, requesterObj)

		data, err := api.business.AdminGetAccountCredentials(ctx, int32(id))
		if err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(data))
	}
}
