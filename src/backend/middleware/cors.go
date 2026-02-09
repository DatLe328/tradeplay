package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func Cors() gin.HandlerFunc {
	allowedOrigins := strings.Split(os.Getenv("FRONTEND_ORIGINS"), ",")

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if os.Getenv("APP_ENV") == "dev" {
			// In dev mode, allow the requesting origin (not wildcard for credentials)
			if origin != "" {
				c.Header("Access-Control-Allow-Origin", origin)
			} else {
				c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
			}
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Captcha-Token, X-CSRF-Token")
			c.Header("Access-Control-Max-Age", "86400")

			if c.Request.Method == "OPTIONS" {
				c.AbortWithStatus(204)
				return
			}
			c.Next()
			return
		}

		for _, allowed := range allowedOrigins {
			if origin == strings.TrimSpace(allowed) {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Credentials", "true")
				break
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Header(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With, X-Captcha-Token, X-CSRF-Token",
		)
		c.Header("Access-Control-Max-Age", "86400")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
