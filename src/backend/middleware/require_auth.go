package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthClient interface {
	IntrospectToken(ctx context.Context, accessToken string) (*jwt.RegisteredClaims, error)
}

func RequireAuth(ac AuthClient) func(*gin.Context) {
	return func(c *gin.Context) {
		token, err := extractTokenFromHeaderString(c.GetHeader("Authorization"))

		if err != nil {
			cookieToken, cookieErr := c.Cookie("accessToken")
			if cookieErr == nil && cookieToken != "" {
				token = cookieToken
				err = nil
			}
		}

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, core.ErrUnauthorized(err, "missing access token", "unauthorized"))
			return
		}

		claims, err := ac.IntrospectToken(c.Request.Context(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, core.ErrUnauthorized(err, err.Error(), "unauthorized"))
			return
		}

		sub := claims.Subject
		tid := claims.ID

		c.Set(core.KeyRequester, core.NewRequester(sub, tid))
		c.Next()
	}
}

func extractTokenFromHeaderString(s string) (string, error) {
	parts := strings.Split(s, " ")
	//"Authorization" : "Bearer {token}"

	if parts[0] != "Bearer" || len(parts) < 2 || strings.TrimSpace(parts[1]) == "" || strings.TrimSpace(parts[1]) == "null" {
		return "", errors.New("missing access token from header")
	}

	return parts[1], nil
}
