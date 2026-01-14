package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/middleware"
	"tradeplay/services/auth/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) LoginHdl() func(*gin.Context) {
	return func(c *gin.Context) {
		var data entity.AuthEmailPassword

		if err := c.ShouldBind(&data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		response, err := api.business.Authenticate(c.Request.Context(), &data)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		origin := c.GetHeader("Origin")
		cookieDomain := common.GetCookieDomainForOrigin(origin)

		c.SetSameSite(http.SameSiteNoneMode)

		c.SetCookie(
			"accessToken",
			response.AccessToken.Token,
			response.AccessToken.ExpiredIn,
			"/",
			cookieDomain,
			true,
			true,
		)

		if response.RefreshToken != nil {
			c.SetCookie(
				"refreshToken",
				response.RefreshToken.Token,
				response.RefreshToken.ExpiredIn,
				"/",
				cookieDomain,
				true,
				true,
			)
		}

		csrfToken, err := middleware.SetCSRFToken(c)
		if err != nil {
			csrfToken = ""
		}

		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"data": gin.H{
				"message":    "login successful",
				"csrf_token": csrfToken,
			},
		})
	}
}
