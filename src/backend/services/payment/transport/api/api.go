package api

import (
	"context"
	paymentEntity "tradeplay/services/payment/entity"

	sctx "github.com/DatLe328/service-context"
)

type PaymentBusiness interface {
	ProcessSepayWebhook(ctx context.Context, payload *paymentEntity.SepayWebhookPayload) error
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
