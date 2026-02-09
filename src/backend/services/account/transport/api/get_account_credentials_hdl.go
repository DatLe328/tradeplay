package api

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"tradeplay/common"

	"github.com/gin-gonic/gin"
)

func (api *api) GetAccountCredentialsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		if id < 0 {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(nil))
			return
		}

		requester, exists := c.Get(common.KeyRequester)
		if !exists {
			common.WriteErrorResponse(c, common.ErrUnauthorized(errors.New("unauthorized"), "unauthorized"))
			return
		}

		requesterObj := requester.(common.Requester)
		uid, _ := common.FromBase58(requesterObj.GetSubject())
		requesterId := int32(uid.GetLocalID())

		ctx := context.WithValue(c.Request.Context(), common.KeyRequester, requesterObj)

		data, err := api.business.GetAccountCredentials(ctx, requesterId, int32(id))
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(data))
	}
}
