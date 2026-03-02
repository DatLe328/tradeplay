package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"tradeplay/common"
	paymentEntity "tradeplay/services/payment/entity"

	"github.com/gin-gonic/gin"
)

type SepayResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

func (h *api) HandleSepayWebhook(c *gin.Context) {
	configComp := h.serviceCtx.MustGet(common.KeyCompConf).(common.AppConfig)
	myApiKey := configComp.SepayAPIKey()

	if myApiKey == "" {
		fmt.Println("[CRITICAL ERROR] Sepay API Key is missing in server configuration!")

		c.JSON(http.StatusInternalServerError, common.ErrInternal(errors.New("Server misconfiguration: Payment API Key is missing")))
		return
	}

	authHeader := c.GetHeader("Authorization")
	expectedHeader := "Apikey " + myApiKey

	if authHeader != expectedHeader {
		c.JSON(http.StatusUnauthorized, common.ErrInvalidCredentials(errors.New("Invalid SePay API Key")))
		return
	}

	signature := c.GetHeader("X-Webhook-Signature")
	if signature == "" {
		signature = c.GetHeader("X-Signature")
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusOK, SepayResponse{Success: false, Message: "Failed to read request body"})
		return
	}

	var payload paymentEntity.SepayWebhookPayload
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		c.JSON(http.StatusOK, SepayResponse{Success: false, Message: "Invalid JSON format"})
		return
	}

	var finalOrderId string
	prefix := "DH"

	if payload.Code != "" && strings.HasPrefix(payload.Code, prefix) {
		finalOrderId = strings.TrimPrefix(payload.Code, prefix)
	}

	if finalOrderId == "" {
		extracted, err := extractOrderCode(payload.Content)
		if err == nil {
			finalOrderId = extracted
		} else {
			fmt.Printf("Fallback extract failed: %v\n", err)
		}
	}

	if finalOrderId == "" {
		c.JSON(http.StatusOK, SepayResponse{Success: false, Message: "Order code not found"})
		return
	}

	err = h.business.ProcessSepayWebhook(c.Request.Context(), &payload, finalOrderId, signature, bodyBytes)

	if err != nil {
		c.JSON(http.StatusInternalServerError, common.ErrInternal(err))
		return
	}

	c.JSON(http.StatusOK, SepayResponse{
		Success: true,
		Message: "Webhook processed successfully",
	})
}

func extractOrderCode(content string) (string, error) {
	prefix := "DH"

	idx := strings.Index(content, prefix)
	if idx == -1 {
		return "", fmt.Errorf("không tìm thấy prefix %s trong nội dung: %s", prefix, content)
	}

	start := idx + len(prefix)

	return content[start:], nil
}
