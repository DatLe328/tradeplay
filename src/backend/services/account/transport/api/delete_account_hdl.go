package api

import (
	"net/http"
	"strconv"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) DeleteAccountHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		if err := api.business.DeleteAccount(c.Request.Context(), id); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
