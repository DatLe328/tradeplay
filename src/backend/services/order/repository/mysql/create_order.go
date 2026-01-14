package mysql

import (
	"context"
	accountEntity "tradeplay/services/account/entity"
	orderEntity "tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) CreateOrder(ctx context.Context, order *orderEntity.Order) error {
	tx := repo.db.Begin()

	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		return core.ErrDB(err)
	}

	if err := tx.Table(accountEntity.Account{}.TableName()).
		Where("id = ?", order.AccountId).
		Update("status", accountEntity.AccountStatusReserved).Error; err != nil {
		tx.Rollback()
		return core.ErrDB(err)
	}

	if err := tx.Commit().Error; err != nil {
		return core.ErrDB(err)
	}

	return nil
}
