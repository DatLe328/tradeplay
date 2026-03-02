package middleware

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"time"
	"tradeplay/common"
	sctx "tradeplay/pkg/service-context"

	"github.com/gin-gonic/gin"
)

type turnstileResponse struct {
	Success     bool     `json:"success"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
	ErrorCodes  []string `json:"error-codes"`
}

func VerifyTurnstile(serviceCtx sctx.ServiceContext) gin.HandlerFunc {
	return func(c *gin.Context) {
		if serviceCtx.EnvName() == sctx.DevEnv {
			c.Next()
			return
		}
		token := c.GetHeader("X-Captcha-Token")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, common.ErrInvalidRequest(errors.New("missing captcha token")))
			return
		}

		secretKey := os.Getenv("TURNSTILE_SECRET_KEY")
		verifyURL := "https://challenges.cloudflare.com/turnstile/v0/siteverify"

		payload := url.Values{}
		payload.Set("secret", secretKey)
		payload.Set("response", token)
		payload.Set("remoteip", c.ClientIP())

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.PostForm(verifyURL, payload)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}
		defer resp.Body.Close()

		var result turnstileResponse
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}

		if !result.Success {
			c.AbortWithStatusJSON(http.StatusBadRequest, common.ErrInvalidRequest(errors.New("invalid captcha")))
			return
		}

		c.Next()
	}
}
