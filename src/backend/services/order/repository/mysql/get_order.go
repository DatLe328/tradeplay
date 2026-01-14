package mysql

import (
	"context"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) GetOrder(ctx context.Context, id int) (*entity.Order, error) {
	var data entity.Order

	if err := repo.db.Table(entity.Order{}.TableName()).
		Preload("Account").
		Where("id = ?", id).
		First(&data).Error; err != nil {
		return nil, core.ErrDB(err)
	}

	return &data, nil
}
