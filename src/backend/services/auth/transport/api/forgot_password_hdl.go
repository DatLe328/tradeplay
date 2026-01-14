package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) ForgotPasswordHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var data struct {
			Email string `json:"email"`
		}
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		if err := api.business.ForgotPassword(c.Request.Context(), data.Email); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}
		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}

func (api *api) ResetPasswordHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var data entity.ResetPasswordData
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		if err := api.business.ResetPassword(c.Request.Context(), &data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}
		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
