package mysql

import (
	"context"
	"tradeplay/services/order/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) UpdateOrderStatus(ctx context.Context, tx *gorm.DB, id int, status entity.OrderStatus) error {
	db := repo.db
	if tx != nil {
		db = tx
	}

	return db.Model(&entity.Order{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (repo *mysqlRepo) UpdateOrderPaid(ctx context.Context, tx *gorm.DB, id int, method string, ref string) error {
	db := repo.db
	if tx != nil {
		db = tx
	}

	updates := map[string]interface{}{
		"status":           entity.OrderStatusPaid,
		"payment_method":   method,
		"payment_trans_id": ref,
	}

	return db.Model(&entity.Order{}).
		Where("id = ?", id).
		Updates(updates).Error
}
