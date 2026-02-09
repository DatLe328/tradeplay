package mysql

import (
	"context"
	"tradeplay/services/order/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) CreateOrderHistory(ctx context.Context, tx *gorm.DB, history *entity.OrderHistory) error {
	db := repo.db
	if tx != nil {
		db = tx
	}

	return db.Create(history).Error
}
