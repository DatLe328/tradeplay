package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) VerifyEmailHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var data entity.VerifyEmailData

		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		if err := api.business.VerifyEmail(c.Request.Context(), &data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}
