package api

import (
	"errors"
	"net/http"
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
