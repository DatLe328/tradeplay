package api

import (
	"net/http"
	"tradeplay/common"

	"github.com/gin-gonic/gin"
)

func (api *api) LogoutHdl() func(*gin.Context) {
	return func(c *gin.Context) {
		refreshToken, err := c.Cookie("refreshToken")

		if err == nil && refreshToken != "" {
			_ = api.business.Logout(c.Request.Context(), refreshToken)
		}

		origin := c.GetHeader("Origin")
		cookieDomain := common.GetCookieDomainForOrigin(origin)
		c.SetSameSite(http.SameSiteNoneMode)

		c.SetCookie(
			"accessToken",
			"",
			-1,
			"/",
			cookieDomain,
			true,
			true,
		)

		c.SetCookie(
			"refreshToken",
			"",
			-1,
			"/",
			cookieDomain,
			true,
			true,
		)

		c.SetCookie(
			"csrf_token",
			"",
			-1,
			"/",
			cookieDomain,
			true,
			true,
		)

		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"data": gin.H{
				"message": "logged out successfully",
			},
		})
	}
}
