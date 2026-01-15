package middleware

import (
	"bytes"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"tradeplay/common"

	"github.com/gin-gonic/gin"
)

const (
	CSRFTokenCookieName = "csrf_token"
	CSRFTokenHeaderName = "X-CSRF-Token"
)

func GenerateCSRFToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func SetCSRFToken(c *gin.Context) (string, error) {
	token, err := GenerateCSRFToken()
	if err != nil {
		return "", err
	}

	cookieDomain := common.GetCookieDomainForOrigin(c.GetHeader("Origin"))
	c.SetSameSite(http.SameSiteLaxMode)

	c.SetCookie(
		CSRFTokenCookieName,
		token,
		3600,
		"/",
		cookieDomain,
		true,
		true,
	)

	return token, nil
}

func ValidateCSRFToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" ||
			c.Request.Method == "DELETE" || c.Request.Method == "PATCH" {

			cookieToken, err := c.Cookie(CSRFTokenCookieName)

			if err != nil || cookieToken == "" {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "CSRF protection: missing csrf cookie",
				})
				return
			}

			var requestToken string
			requestToken = c.GetHeader(CSRFTokenHeaderName)

			if requestToken == "" {
				requestToken = c.PostForm("csrf_token")
			}
			if requestToken == "" {
				requestToken = c.Query("csrf_token")
			}
			if requestToken == "" && c.ContentType() == "application/json" {
				bodyBytes, err := io.ReadAll(c.Request.Body)
				if err == nil && len(bodyBytes) > 0 {
					c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
					var jsonData map[string]interface{}
					if err := json.Unmarshal(bodyBytes, &jsonData); err == nil {
						if token, exists := jsonData["csrf_token"].(string); exists && token != "" {
							requestToken = token
						}
					}
				}
			}

			if requestToken == "" {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "CSRF protection: missing csrf token in request",
				})
				return
			}

			if subtle.ConstantTimeCompare([]byte(requestToken), []byte(cookieToken)) != 1 {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "CSRF protection: invalid csrf token",
				})
				return
			}
		}

		c.Next()
	}
}

func CSRFProtection() gin.HandlerFunc {
	allowedOrigins := strings.Split(os.Getenv("FRONTEND_ORIGINS"), ",")

	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" ||
			c.Request.Method == "DELETE" || c.Request.Method == "PATCH" {

			origin := c.GetHeader("Origin")
			if origin == "" {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "CSRF protection: Origin header required",
				})
				return
			}

			isAllowed := false
			for _, allowed := range allowedOrigins {
				if origin == strings.TrimSpace(allowed) {
					isAllowed = true
					break
				}
			}

			if !isAllowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"code":    403,
					"message": "CSRF protection: Origin not allowed",
				})
				return
			}
		}
		c.Next()
	}
}
