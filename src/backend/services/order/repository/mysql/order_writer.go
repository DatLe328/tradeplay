package mysql

import (
	"context"
	"tradeplay/common"
	accountEntity "tradeplay/services/account/entity"
	orderEntity "tradeplay/services/order/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) CreateOrder(ctx context.Context, order *orderEntity.Order) error {
	db := repo.db.WithContext(ctx)

	return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return common.ErrDB(err)
		}

		if err := tx.Table(accountEntity.Account{}.TableName()).
			Where("id = ?", order.AccountID).
			Update("status", accountEntity.AccountStatusReserved).Error; err != nil {
			return common.ErrDB(err)
		}

		return nil
	})
}

func (repo *mysqlRepo) UpdateOrderStatus(ctx context.Context, tx *gorm.DB, id int32, status orderEntity.OrderStatus) error {
	db := repo.db
	if tx != nil {
		db = tx
	}

	return db.Model(&orderEntity.Order{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (repo *mysqlRepo) UpdateOrderPaid(ctx context.Context, tx *gorm.DB, id int32, method string, ref string) error {
	db := repo.db
	if tx != nil {
		db = tx
	}

	updates := map[string]interface{}{
		"status":           orderEntity.OrderStatusPaid,
		"payment_method":   method,
		"payment_trans_id": ref,
	}

	return db.Model(&orderEntity.Order{}).
		Where("id = ?", id).
		Updates(updates).Error
}

func (repo *mysqlRepo) UpdateOrderCompleted(ctx context.Context, tx *gorm.DB, id int32) error {
	db := repo.db
	if tx != nil {
		db = tx
	}

	return db.Model(&orderEntity.Order{}).
		Where("id = ?", id).
		Update("status", orderEntity.OrderStatusCompleted).Error
}

func (repo *mysqlRepo) DeleteOrdersByAccountId(ctx context.Context, accountID int32) error {
	if err := repo.db.WithContext(ctx).
		Where("account_id = ?", accountID).
		Delete(&orderEntity.Order{}).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}
