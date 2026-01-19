package mysql

import (
	"context"
	orderEntity "tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) ListAllOrders(ctx context.Context, filter *orderEntity.OrderFilter, paging *core.Paging) ([]orderEntity.Order, error) {
	var result []orderEntity.Order
	db := repo.db.Table(orderEntity.Order{}.TableName())

	if filter != nil {
		if filter.Type != nil {
			db = db.Where("type = ?", *filter.Type)
		}
	}

	if err := db.Count(&paging.Total).Error; err != nil {
		return nil, core.ErrDB(err)
	}

	if err := db.Preload("Account").
		Offset((paging.Page - 1) * paging.Limit).
		Limit(paging.Limit).
		Order("id desc").
		Find(&result).Error; err != nil {
		return nil, core.ErrDB(err)
	}

	return result, nil
}
