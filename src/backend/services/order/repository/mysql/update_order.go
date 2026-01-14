package mysql

import (
	"context"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) UpdateOrderStatus(ctx context.Context, id int, status entity.OrderStatus) error {
	if err := repo.db.Table(entity.Order{}.TableName()).
		Where("id = ?", id).
		Update("status", status).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
