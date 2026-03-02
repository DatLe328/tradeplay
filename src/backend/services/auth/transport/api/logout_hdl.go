package api

import (
	"net/http"
	ginc "tradeplay/components/ginc"

	"github.com/gin-gonic/gin"
)

func (api *api) LogoutHdl() gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshToken, err := c.Cookie("refreshToken")

		if err == nil && refreshToken != "" {
			_ = api.business.Logout(c.Request.Context(), refreshToken)
		}

		origin := c.GetHeader("Origin")
		cookieDomain := ginc.GetCookieDomainForOrigin(origin)

		var sameSite http.SameSite
		var secure bool

		sameSite = http.SameSiteNoneMode
		secure = true

		c.SetSameSite(sameSite)
		c.SetCookie(
			"accessToken",
			"",
			-1,
			"/",
			cookieDomain,
			secure,
			true,
		)

		c.SetSameSite(sameSite)
		c.SetCookie(
			"refreshToken",
			"",
			-1,
			"/",
			cookieDomain,
			secure,
			true,
		)

		c.SetSameSite(sameSite)
		c.SetCookie(
			"csrf_token",
			"",
			-1,
			"/",
			cookieDomain,
			secure,
			false,
		)

		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"data": gin.H{
				"message": "logged out successfully",
			},
		})
	}
}
