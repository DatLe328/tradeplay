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

		// --- BẮT ĐẦU ĐOẠN SET COOKIE (Đã dọn dẹp) ---

		origin := c.GetHeader("Origin")
		cookieDomain := common.GetCookieDomainForOrigin(origin)

		// ✅ QUAN TRỌNG: Cấu hình SameSite=None CHO TẤT CẢ COOKIES TIẾP THEO
		c.SetSameSite(http.SameSiteNoneMode)

		// 1. Set Access Token
		c.SetCookie(
			"accessToken",
			response.AccessToken.Token,
			response.AccessToken.ExpiredIn,
			"/",
			cookieDomain,
			true, // Secure (True vì chạy HTTPS)
			true, // HttpOnly
		)

		// 2. Set Refresh Token (nếu có)
		if response.RefreshToken != nil {
			c.SetCookie(
				"refreshToken",
				response.RefreshToken.Token,
				response.RefreshToken.ExpiredIn,
				"/",
				cookieDomain,
				true, // Secure
				true, // HttpOnly
			)
		}

		// 3. Set CSRF Token
		// Lưu ý: middleware.SetCSRFToken cũng set cookie, nên nó sẽ hưởng setting SameSiteNone ở trên
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
