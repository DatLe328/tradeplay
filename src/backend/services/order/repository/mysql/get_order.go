package mysql

import (
	"context"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
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

func (repo *mysqlRepo) GetOrderForUpdate(ctx context.Context, tx *gorm.DB, id int) (*entity.Order, error) {
	var order entity.Order

	db := repo.db
	if tx != nil {
		db = tx
	}

	if err := db.Set("gorm:query_option", "FOR UPDATE").
		First(&order, id).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

func (s *mysqlRepo) GetOrderByUserAndAccount(ctx context.Context, userId, accountId int) (*entity.Order, error) {
	var data entity.Order
	if err := s.db.Where("user_id = ? AND account_id = ? AND status != ?", userId, accountId, entity.OrderStatusCancelled).First(&data).Error; err != nil {
		return nil, err
	}
	return &data, nil
}

func (repo *mysqlRepo) HasUserPurchasedAccount(ctx context.Context, userId int, accountId int) (bool, error) {
	var count int64

	successStatuses := []entity.OrderStatus{
		entity.OrderStatusPaid,
		entity.OrderStatusCompleted,
	}

	err := repo.db.Table(entity.Order{}.TableName()).
		Where("user_id = ?", userId).
		Where("account_id = ?", accountId).
		Where("status IN ?", successStatuses).
		Count(&count).Error

	if err != nil {
		return false, core.ErrDB(err)
	}

	return count > 0, nil
}
