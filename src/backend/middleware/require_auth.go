package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"tradeplay/common"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthClient interface {
	IntrospectToken(ctx context.Context, accessToken string) (*jwt.RegisteredClaims, error)
	IsTokenRevoked(ctx context.Context, tokenID string) bool
}

func RequireAuth(ac AuthClient) gin.HandlerFunc {
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
			c.AbortWithStatusJSON(http.StatusUnauthorized, common.ErrUnauthorized(err, "missing access token"))
			return
		}

		claims, err := ac.IntrospectToken(c.Request.Context(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, common.ErrUnauthorized(err, err.Error()))
			return
		}

		if ac.IsTokenRevoked(c.Request.Context(), claims.ID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, common.ErrUnauthorized(errors.New("token revoked"), "token is no longer valid"))
			return
		}

		sub := claims.Subject
		tid := claims.ID

		c.Set(common.KeyRequester, common.NewRequester(sub, tid))
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
