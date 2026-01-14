package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) ListAccountHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var paging core.Paging
		var filter entity.Filter

		if err := c.ShouldBindQuery(&paging); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		if err := c.ShouldBindQuery(&filter); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		paging.Process()

		result, err := api.business.ListAccount(c.Request.Context(), &filter, &paging)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.SuccessResponse(result, paging, filter))
	}
}
