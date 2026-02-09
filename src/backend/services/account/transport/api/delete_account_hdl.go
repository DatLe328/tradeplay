package api

import (
	"net/http"
	"strconv"
	"tradeplay/common"

	"github.com/gin-gonic/gin"
)

func (api *api) DeleteAccountHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		if err := api.business.DeleteAccount(c.Request.Context(), int32(id)); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}
