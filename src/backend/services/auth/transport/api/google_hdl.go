package api

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"tradeplay/common"
	"tradeplay/middleware"

	"github.com/gin-gonic/gin"
)

func (api *api) GoogleLoginHdl() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientID := os.Getenv("GOOGLE_CLIENT_ID")
		redirectURI := os.Getenv("GOOGLE_REDIRECT_URL")
		scope := "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"

		authURL := fmt.Sprintf(
			"https://accounts.google.com/o/oauth2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&prompt=select_account",
			clientID,
			url.QueryEscape(redirectURI),
			url.QueryEscape(scope),
		)

		c.Redirect(http.StatusTemporaryRedirect, authURL)
	}
}

func (api *api) GoogleCallbackHdl() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Lấy Frontend URL
		frontendURL := os.Getenv("FRONTEND_ORIGINS") // Ví dụ: https://test.tadeldev.site

		// 2. Kiểm tra Code
		code := c.Query("code")
		if code == "" {
			c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/login?error=%s", frontendURL, "No code provided"))
			return
		}

		// 3. Gọi Business xử lý
		tokenResp, err := api.business.LoginWithGoogle(c.Request.Context(), code)
		if err != nil {
			redirectErr := fmt.Sprintf("%s/auth/login?error=%s", frontendURL, url.QueryEscape("Login failed: "+err.Error()))
			c.Redirect(http.StatusTemporaryRedirect, redirectErr)
			return
		}

		// =================================================================
		// ✅ SỬA ĐỔI QUAN TRỌNG: SET COOKIE THAY VÌ TRẢ VỀ URL
		// =================================================================

		// A. Tính toán Cookie Domain dựa trên frontendURL
		// (Vì request này là redirect từ Google nên header Origin có thể không có, ta dùng frontendURL cấu hình trong env)
		cookieDomain := common.GetCookieDomainForOrigin(frontendURL)

		// B. Cấu hình SameSite
		c.SetSameSite(http.SameSiteNoneMode)

		// C. Set Access Token Cookie
		c.SetCookie(
			"accessToken",
			tokenResp.AccessToken.Token,
			tokenResp.AccessToken.ExpiredIn,
			"/",
			cookieDomain,
			true, // Secure
			true, // HttpOnly
		)

		// D. Set Refresh Token Cookie
		if tokenResp.RefreshToken != nil {
			c.SetCookie(
				"refreshToken",
				tokenResp.RefreshToken.Token,
				tokenResp.RefreshToken.ExpiredIn,
				"/",
				cookieDomain,
				true,
				true,
			)
		}

		// E. Tạo và Set CSRF Token (Để frontend dùng cho các request sau)
		csrfToken, err := middleware.SetCSRFToken(c)
		if err != nil {
			csrfToken = ""
		}

		// 4. Redirect về Frontend (Thành công)
		// ⚠️ KHÔNG gửi token lên URL nữa. Chỉ gửi csrf_token (không nhạy cảm) để frontend lưu lại.
		// Frontend sẽ tự gọi /user/me để lấy thông tin user nhờ vào cookie vừa set.
		redirectSuccess := fmt.Sprintf("%s/auth/google-success?csrf_token=%s", frontendURL, csrfToken)

		c.Redirect(http.StatusTemporaryRedirect, redirectSuccess)
	}
}
