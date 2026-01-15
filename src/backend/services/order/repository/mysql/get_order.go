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

func (s *mysqlRepo) GetOrderByUserAndAccount(ctx context.Context, userId, accountId int) (*entity.Order, error) {
	var data entity.Order
	if err := s.db.Where("user_id = ? AND account_id = ? AND status != ?", userId, accountId, entity.OrderStatusCancelled).First(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}
