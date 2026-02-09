package business

import (
	"context"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	notificationRepository "tradeplay/services/notification/repository"
	orderEntity "tradeplay/services/order/entity"
	paymentEntity "tradeplay/services/payment/entity"

	"gorm.io/gorm"
)

type orderBusiness interface {
	GetOrderInternal(ctx context.Context, id int32) (*orderEntity.Order, error)
	MarkOrderAsPaid(ctx context.Context, tx *gorm.DB, orderId int32, amount int64, gateway string, refCode string) (*orderEntity.Order, error)
	MarkOrderAsCompleted(ctx context.Context, tx *gorm.DB, orderID int32, note string) error
}

type walletBusiness interface {
	Deposit(ctx context.Context, tx *gorm.DB, userId int32, amount int64, refId string, description string, metadata *common.JSON) error
}

type auditRepository interface {
	PushAuditLog(ctx context.Context, log *auditEntity.AuditLog)
}

type paymentRepository interface {
	GetPaymentWebhookBySepayID(ctx context.Context, tx *gorm.DB, sepayID string) (*paymentEntity.PaymentWebhook, error)
	CreatePaymentWebhook(ctx context.Context, tx *gorm.DB, webhook *paymentEntity.PaymentWebhook) error
	UpdatePaymentWebhookStatus(ctx context.Context, tx *gorm.DB, referenceCode string, status string) error
}

type business struct {
	db                    *gorm.DB
	repo                  paymentRepository
	orderBusiness         orderBusiness
	walletBusiness        walletBusiness
	auditRepo             auditRepository
	notificationRepository notificationRepository.NotificationRepository
	sepayApiKey           string
}

func NewBusiness(
	db *gorm.DB,
	repo paymentRepository,
	orderBiz orderBusiness,
	walletBiz walletBusiness,
	auditRepo auditRepository,
	notifRepo notificationRepository.NotificationRepository,
	sepayApiKey string,
) *business {
	return &business{
		db:                    db,
		repo:                  repo,
		orderBusiness:         orderBiz,
		walletBusiness:        walletBiz,
		auditRepo:             auditRepo,
		notificationRepository: notifRepo,
		sepayApiKey:           sepayApiKey,
	}
}
