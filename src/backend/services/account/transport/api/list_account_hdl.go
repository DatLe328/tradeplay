package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) FindAccountsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var paging common.Paging
		var filter entity.Filter

		if err := c.ShouldBindQuery(&paging); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		if err := c.ShouldBindQuery(&filter); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		paging.Process()

		result, err := api.business.FindAccounts(c.Request.Context(), &filter, &paging)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.SuccessResponse(result, paging, filter))
	}
}
