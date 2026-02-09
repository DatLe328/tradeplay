package mysql

import (
	"context"
	"tradeplay/common"
	orderEntity "tradeplay/services/order/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) GetOrder(ctx context.Context, id int32) (*orderEntity.Order, error) {
	var data orderEntity.Order

	if err := repo.db.Table(orderEntity.Order{}.TableName()).
		Preload("Account").
		Where("id = ?", id).
		First(&data).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	return &data, nil
}

func (repo *mysqlRepo) GetOrderForUpdate(ctx context.Context, tx *gorm.DB, id int32) (*orderEntity.Order, error) {
	var order orderEntity.Order

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

func (repo *mysqlRepo) HasUserPurchasedAccount(
	ctx context.Context,
	userID int32,
	accountID int32,
) (bool, error) {
	var count int64

	validStatuses := []orderEntity.OrderStatus{
		orderEntity.OrderStatusPaid,
		orderEntity.OrderStatusCompleted,
	}

	err := repo.db.Table(orderEntity.Order{}.TableName()).
		Where("user_id = ?", userID).
		Where("account_id = ?", accountID).
		Where("status IN ?", validStatuses).
		Count(&count).Error

	if err != nil {
		return false, common.ErrDB(err)
	}

	return count > 0, nil
}

func (repo *mysqlRepo) FindOrders(
	ctx context.Context,
	userID int32,
	filter *orderEntity.OrderFilter,
	paging *common.Paging,
) ([]orderEntity.Order, error) {
	var result []orderEntity.Order
	db := repo.db.Table(orderEntity.Order{}.TableName())

	db = db.Where("user_id = ?", userID)

	if filter != nil {
		if filter.Type != nil {
			db = db.Where("type = ?", *filter.Type)
		}
	}

	if err := db.Count(&paging.Total).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	if err := db.Preload("Account").
		Offset((paging.Page - 1) * paging.Limit).
		Limit(paging.Limit).
		Order("id desc").
		Find(&result).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	return result, nil
}

func (repo *mysqlRepo) GetAllOrders(ctx context.Context, filter *orderEntity.OrderFilter, paging *common.Paging) ([]orderEntity.Order, error) {
	var result []orderEntity.Order
	db := repo.db.Table(orderEntity.Order{}.TableName())

	if filter != nil {
		if filter.Type != nil {
			db = db.Where("type = ?", *filter.Type)
		}
	}

	if err := db.Count(&paging.Total).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	if err := db.Preload("Account").
		Offset((paging.Page - 1) * paging.Limit).
		Limit(paging.Limit).
		Order("id desc").
		Find(&result).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	return result, nil
}
