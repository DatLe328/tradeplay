package middleware

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

type turnstileResponse struct {
	Success     bool     `json:"success"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
	ErrorCodes  []string `json:"error-codes"`
}

func VerifyTurnstile() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("X-Captcha-Token")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, core.ErrInvalidRequest(errors.New("missing captcha token")))
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
			c.AbortWithStatusJSON(http.StatusInternalServerError, core.ErrInternal(err))
			return
		}
		defer resp.Body.Close()

		var result turnstileResponse
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, core.ErrInternal(err))
			return
		}

		if !result.Success {
			c.AbortWithStatusJSON(http.StatusBadRequest, core.ErrInvalidRequest(errors.New("invalid captcha")))
			return
		}

		c.Next()
	}
}
