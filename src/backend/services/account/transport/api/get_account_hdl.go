package api

import (
	"net/http"
	"strconv"
	"tradeplay/common"

	"github.com/gin-gonic/gin"
)

func (api *api) GetAccountHandler() gin.HandlerFunc {
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

		data, err := api.business.GetAccount(c.Request.Context(), int32(id))
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(data))
	}
}
