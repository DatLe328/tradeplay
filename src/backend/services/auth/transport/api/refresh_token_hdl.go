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
		// ✅ Lấy refresh token từ cookie thay vì từ body
		refreshToken, err := c.Cookie("refreshToken")
		if err != nil || refreshToken == "" {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		resp, err := api.business.RefreshToken(c.Request.Context(), refreshToken)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		origin := c.GetHeader("Origin")
		cookieDomain := common.GetCookieDomainForOrigin(origin)

		// ✅ Set SameSite cho các cookies bên dưới
		c.SetSameSite(http.SameSiteNoneMode)

		// 1. Set Access Token
		c.SetCookie(
			"accessToken",
			resp.AccessToken.Token,
			resp.AccessToken.ExpiredIn,
			"/",
			cookieDomain,
			true, // Secure
			true, // HttpOnly
		)

		// 2. Set Refresh Token (nếu có)
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

		// 3. Refresh CSRF Token
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
