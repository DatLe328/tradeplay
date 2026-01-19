package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/middleware"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) RefreshTokenHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		refreshToken, err := c.Cookie("refreshToken")
		if err != nil || refreshToken == "" {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		userAgent := c.Request.UserAgent()
		clientIP := c.ClientIP()

		resp, err := api.business.RefreshToken(c.Request.Context(), refreshToken, userAgent, clientIP)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		origin := c.GetHeader("Origin")
		cookieDomain := common.GetCookieDomainForOrigin(origin)

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
