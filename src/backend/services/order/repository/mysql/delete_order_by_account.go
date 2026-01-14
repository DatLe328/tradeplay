package mysql

import (
	"context"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) DeleteOrdersByAccountId(ctx context.Context, accountId int) error {
	if err := repo.db.WithContext(ctx).
		Where("account_id = ?", accountId).
		Delete(&entity.Order{}).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
