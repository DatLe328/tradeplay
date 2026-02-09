package api

import (
	"context"
	sctx "tradeplay/components/service-context"
	paymentEntity "tradeplay/services/payment/entity"
)

type PaymentBusiness interface {
	ProcessSepayWebhook(ctx context.Context, payload *paymentEntity.SepayWebhookPayload, orderID string, signature string, payloadBytes []byte) error
}

type api struct {
	serviceCtx sctx.ServiceContext
	business   PaymentBusiness
}

func NewPaymentHandler(serviceCtx sctx.ServiceContext, business PaymentBusiness) *api {
	return &api{
		serviceCtx: serviceCtx,
		business:   business,
	}
}
