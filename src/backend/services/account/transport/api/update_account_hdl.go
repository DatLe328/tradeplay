package api

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) UpdateAccountHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		var data entity.AccountDataPatch
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		requester, exists := c.Get(core.KeyRequester)
		if !exists {
			common.WriteErrorResponse(c, core.ErrUnauthorized(errors.New("unauthorized"), "unauthorized", "unauthorized"))
			return
		}

		ctx := context.WithValue(c.Request.Context(), core.KeyRequester, requester)

		if err := api.business.UpdateAccount(ctx, id, &data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
