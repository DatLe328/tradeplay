package business

import (
	"context"
	"tradeplay/services/order/entity"
)

func (biz *business) GetOrderInternal(ctx context.Context, id int32) (*entity.Order, error) {
	order, err := biz.orderRepository.GetOrder(ctx, id)
	if err != nil {
		return nil, err
	}
	return order, nil
}
