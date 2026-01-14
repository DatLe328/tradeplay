package business

import (
	"context"
	"errors"
	accountEntity "tradeplay/services/account/entity"
	orderEntity "tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) UpdateOrderStatus(ctx context.Context, id int, status orderEntity.OrderStatus) error {
	switch status {
	case orderEntity.OrderStatusPending,
		orderEntity.OrderStatusPaid,
		orderEntity.OrderStatusCancelled:
	case orderEntity.OrderStatusDelivered:
		order, err := biz.repo.GetOrder(ctx, id)
		if err != nil {
			return core.ErrCannotGetEntity(orderEntity.Order{}.TableName(), err)
		}

		data := accountEntity.AccountDataPatch{
			Status: accountEntity.AccountStatusSold,
		}
		biz.accountRepo.UpdateAccount(ctx, order.AccountId, &data)

	default:
		return core.ErrInvalidRequest(errors.New("invalid status"))
	}

	if err := biz.repo.UpdateOrderStatus(ctx, id, status); err != nil {
		return core.ErrInternal(err)
	}

	return nil
}
