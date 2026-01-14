package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/middleware"
	"tradeplay/services/auth/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) RegisterHdl() func(*gin.Context) {
	return func(c *gin.Context) {
		var data entity.AuthRegister

		if err := c.ShouldBind(&data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		err := api.business.Register(c.Request.Context(), &data)

		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}
		c.SetSameSite(http.SameSiteNoneMode)

		csrfToken, err := middleware.SetCSRFToken(c)
		if err != nil {
			csrfToken = ""
		}

		c.JSON(http.StatusCreated, gin.H{
			"code": 0,
			"data": gin.H{
				"message":    "register successful",
				"csrf_token": csrfToken,
			},
		})
	}
}
