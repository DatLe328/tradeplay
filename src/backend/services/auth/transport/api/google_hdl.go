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
		frontendURL := os.Getenv("FRONTEND_ORIGINS")

		code := c.Query("code")
		if code == "" {
			c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/login?error=%s", frontendURL, "No code provided"))
			return
		}

		userAgent := c.Request.UserAgent()
		clientIP := c.ClientIP()

		tokenResp, err := api.business.LoginWithGoogle(c.Request.Context(), code, userAgent, clientIP)
		if err != nil {
			redirectErr := fmt.Sprintf("%s/auth/login?error=%s", frontendURL, url.QueryEscape("Login failed: "+err.Error()))
			c.Redirect(http.StatusTemporaryRedirect, redirectErr)
			return
		}

		cookieDomain := common.GetCookieDomainForOrigin(frontendURL)

		c.SetSameSite(http.SameSiteNoneMode)

		c.SetCookie(
			"accessToken",
			tokenResp.AccessToken.Token,
			tokenResp.AccessToken.ExpiredIn*8,
			"/",
			cookieDomain,
			true,
			true,
		)

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

		csrfToken, err := middleware.SetCSRFToken(c)
		if err != nil {
			csrfToken = ""
		}

		redirectSuccess := fmt.Sprintf("%s/auth/google-success?csrf_token=%s", frontendURL, csrfToken)

		c.Redirect(http.StatusTemporaryRedirect, redirectSuccess)
	}
}
