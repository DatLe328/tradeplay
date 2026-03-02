package mysql

import (
	"context"
	"tradeplay/services/order/entity"
)

func (repo *mysqlRepo) CreateOrderHistory(ctx context.Context, history *entity.OrderHistory) error {
	return repo.getDB(ctx).Create(history).Error
}
