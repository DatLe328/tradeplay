package mysql

import (
	"context"
	"fmt"
	"strconv"
	"tradeplay/common"
	orderEntity "tradeplay/services/order/entity"
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

func (repo *mysqlRepo) GetOrderForUpdate(ctx context.Context, id int32) (*orderEntity.Order, error) {
	var order orderEntity.Order

	if err := repo.getDB(ctx).Set("gorm:query_option", "FOR UPDATE").
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

	if paging.Cursor != "" {
		if ci, err := strconv.ParseInt(paging.Cursor, 10, 32); err == nil {
			db = db.Where("id < ?", int32(ci))
		}
	}

	if err := db.Preload("Account").
		Order("id desc").
		Limit(paging.Limit + 1).
		Find(&result).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	if len(result) > paging.Limit {
		paging.HasMore = true
		paging.NextCursor = fmt.Sprintf("%d", result[paging.Limit-1].ID)
		result = result[:paging.Limit]
	}

	return result, nil
}

// FindPendingDepositOrder returns the first pending deposit order for the given user, if any.
func (repo *mysqlRepo) FindPendingDepositOrder(ctx context.Context, userID int32) (*orderEntity.Order, error) {
	var order orderEntity.Order
	err := repo.db.WithContext(ctx).Where(
		"user_id = ? AND status = ? AND type = ?",
		userID, orderEntity.OrderStatusPending, orderEntity.OrderTypeDeposit,
	).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (repo *mysqlRepo) GetAllOrders(ctx context.Context, filter *orderEntity.OrderFilter, paging *common.Paging) ([]orderEntity.Order, error) {
	var result []orderEntity.Order
	db := repo.db.Table(orderEntity.Order{}.TableName())

	if filter != nil {
		if filter.Type != nil {
			db = db.Where("type = ?", *filter.Type)
		}
	}

	if paging.Cursor != "" {
		if ci, err := strconv.ParseInt(paging.Cursor, 10, 32); err == nil {
			db = db.Where("id < ?", int32(ci))
		}
	}

	if err := db.Preload("Account").
		Order("id desc").
		Limit(paging.Limit + 1).
		Find(&result).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	if len(result) > paging.Limit {
		paging.HasMore = true
		paging.NextCursor = fmt.Sprintf("%d", result[paging.Limit-1].ID)
		result = result[:paging.Limit]
	}

	return result, nil
}
