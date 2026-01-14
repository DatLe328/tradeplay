package business

import (
	"context"
	"errors"
	accountEntity "tradeplay/services/account/entity"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) CreateOrder(ctx context.Context, userId int, accountId int) (*entity.Order, error) {
	account, err := biz.accountRepo.GetAccountByID(ctx, accountId)
	if err != nil {
		return nil, core.ErrInvalidRequest(errors.New("account not found"))
	}

	if account.Status == accountEntity.AccountStatusSold {
		return nil, core.ErrInvalidRequest(errors.New("account is not available"))
	}

	existingOrder, _ := biz.repo.GetOrderByUserAndAccount(ctx, userId, accountId)

	if existingOrder != nil {
		if existingOrder.Status == entity.OrderStatusPending {
			return nil, core.ErrInvalidRequest(errors.New("you already have a pending order for this account"))
		}
		if existingOrder.Status == entity.OrderStatusPaid || existingOrder.Status == entity.OrderStatusDelivered {
			return nil, core.ErrInvalidRequest(errors.New("you already bought this account"))
		}
	}
	newOrder := &entity.Order{
		SQLModel:   core.NewSQLModel(),
		UserId:     userId,
		AccountId:  accountId,
		TotalPrice: account.Price,
		Status:     entity.OrderStatusPending,
	}

	if err := biz.repo.CreateOrder(ctx, newOrder); err != nil {
		return nil, core.ErrInternal(err)
	}

	newOrder.Mask()

	return newOrder, nil
}
