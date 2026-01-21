package api

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"tradeplay/common"
	paymentEntity "tradeplay/services/payment/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

type SepayResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

func (h *api) HandleSepayWebhook(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	configComp := h.serviceCtx.MustGet(common.KeyCompConf).(common.ConfigComponent)
	myApiKey := configComp.SepayAPIKey()
	expectedHeader := "Apikey " + myApiKey

	if myApiKey != "" && authHeader != expectedHeader {
		c.JSON(http.StatusUnauthorized, core.ErrInvalidCredentials(errors.New("Invalid SePay API Key")))
		return
	}

	var payload paymentEntity.SepayWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, core.ErrBadRequest(err, err.Error()))
		return
	}

	var finalOrderId string
	prefix := "DHTCT"

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
		c.JSON(http.StatusBadRequest, core.ErrBadRequest(errors.New("cannot extract order code"), "Could not find order code in both Code and Content fields"))
		return
	}

	payload.Content = finalOrderId

	err := h.business.ProcessSepayWebhook(c.Request.Context(), &payload)

	if err != nil {
		c.JSON(http.StatusInternalServerError, core.ErrInternal(err))
		return
	}

	c.JSON(http.StatusOK, SepayResponse{
		Success: true,
		Message: "Webhook processed successfully",
	})
}

func extractOrderCode(content string) (string, error) {
	prefix := "DHTCT"
	codeLength := 14

	idx := strings.Index(content, prefix)
	if idx == -1 {
		return "", fmt.Errorf("không tìm thấy prefix %s trong nội dung: %s", prefix, content)
	}

	start := idx + len(prefix)
	end := start + codeLength

	if end > len(content) {
		return "", fmt.Errorf("nội dung không đủ %d ký tự sau prefix %s: %s", codeLength, prefix, content)
	}

	return content[start:end], nil
}
