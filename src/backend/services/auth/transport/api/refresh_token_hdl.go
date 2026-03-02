package api

import (
	"net/http"
	"tradeplay/common"
	ginc "tradeplay/components/ginc"
	"tradeplay/middleware"

	"github.com/gin-gonic/gin"
)

func (api *api) RefreshTokenHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshToken, err := c.Cookie("refreshToken")
		if err != nil || refreshToken == "" {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		userAgent := c.Request.UserAgent()
		clientIP := c.ClientIP()

		resp, err := api.business.RefreshToken(c.Request.Context(), refreshToken, userAgent, clientIP)
		if err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		origin := c.GetHeader("Origin")
		cookieDomain := ginc.GetCookieDomainForOrigin(origin)

		c.SetSameSite(http.SameSiteNoneMode)

		c.SetCookie(
			"accessToken",
			resp.AccessToken.Token,
			resp.AccessToken.ExpiredIn,
			"/",
			cookieDomain,
			true,
			true,
		)

		if resp.RefreshToken != nil {
			c.SetCookie(
				"refreshToken",
				resp.RefreshToken.Token,
				resp.RefreshToken.ExpiredIn,
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
				"message":    "token refreshed",
				"csrf_token": csrfToken,
			},
		})
	}
}
