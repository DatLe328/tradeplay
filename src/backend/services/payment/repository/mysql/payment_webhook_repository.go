package mysql

import (
	"context"
	"tradeplay/components/gormc"
	paymentEntity "tradeplay/services/payment/entity"

	"gorm.io/gorm"
)

type paymentWebhookRepository struct {
	db *gorm.DB
}

func NewPaymentWebhookRepository(db *gorm.DB) *paymentWebhookRepository {
	return &paymentWebhookRepository{db: db}
}

// getDB returns the active transaction from context, or the main db if none.
func (repo *paymentWebhookRepository) getDB(ctx context.Context) *gorm.DB {
	if tx, ok := gormc.GormTxFromContext(ctx); ok {
		return tx
	}
	return repo.db
}

// RunInTransaction starts a DB transaction and embeds it in the context passed to fn.
func (repo *paymentWebhookRepository) RunInTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	return repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(gormc.WithGormTx(ctx, tx))
	})
}

func (repo *paymentWebhookRepository) CreatePaymentWebhook(ctx context.Context, webhook *paymentEntity.PaymentWebhook) error {
	return repo.getDB(ctx).WithContext(ctx).Create(webhook).Error
}

func (repo *paymentWebhookRepository) GetPaymentWebhookBySepayID(
	ctx context.Context,
	sepayID string,
) (*paymentEntity.PaymentWebhook, error) {
	var data paymentEntity.PaymentWebhook

	if err := repo.getDB(ctx).WithContext(ctx).
		Where("webhook_id = ?", sepayID).
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (repo *paymentWebhookRepository) UpdatePaymentWebhookStatus(ctx context.Context, referenceCode string, status string) error {
	return repo.getDB(ctx).WithContext(ctx).Model(&paymentEntity.PaymentWebhook{}).
		Where("reference_code = ?", referenceCode).
		Update("status", status).Error
}

func (repo *paymentWebhookRepository) UpdatePaymentWebhookProcessedAt(ctx context.Context, referenceCode string, processedAt interface{}) error {
	return repo.getDB(ctx).WithContext(ctx).Model(&paymentEntity.PaymentWebhook{}).
		Where("reference_code = ?", referenceCode).
		Update("processed_at", processedAt).Error
}
