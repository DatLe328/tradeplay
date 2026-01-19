package mysql

import (
	"context"
	"tradeplay/services/order/entity"
)

func (repo *mysqlRepo) CreateOrderHistory(ctx context.Context, history *entity.OrderHistory) error {
	return repo.db.Create(history).Error
}
