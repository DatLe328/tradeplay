package mysql

import (
	"context"
	paymentEntity "tradeplay/services/payment/entity"

	"gorm.io/gorm"
)

type paymentWebhookRepository struct {
	db *gorm.DB
}

func NewPaymentWebhookRepository(db *gorm.DB) *paymentWebhookRepository {
	return &paymentWebhookRepository{db: db}
}

func (repo *paymentWebhookRepository) CreatePaymentWebhook(ctx context.Context, tx *gorm.DB, webhook *paymentEntity.PaymentWebhook) error {
	if tx == nil {
		tx = repo.db
	}
	return tx.WithContext(ctx).Create(webhook).Error
}

func (repo *paymentWebhookRepository) GetPaymentWebhookBySepayID(
	ctx context.Context,
	tx *gorm.DB,
	sepayID string,
) (*paymentEntity.PaymentWebhook, error) {
	var data paymentEntity.PaymentWebhook
	db := tx
	if db == nil {
		db = repo.db
	}

	if err := db.WithContext(ctx).
		Where("webhook_id = ?", sepayID).
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (repo *paymentWebhookRepository) UpdatePaymentWebhookStatus(ctx context.Context, tx *gorm.DB, referenceCode string, status string) error {
	if tx == nil {
		tx = repo.db
	}
	return tx.WithContext(ctx).Model(&paymentEntity.PaymentWebhook{}).
		Where("reference_code = ?", referenceCode).
		Update("status", status).Error
}
