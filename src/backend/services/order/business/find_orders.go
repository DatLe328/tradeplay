package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/order/entity"
)

func (biz *business) FindOrders(ctx context.Context, userID int32, filter *entity.OrderFilter, paging *common.Paging) ([]entity.Order, error) {
	result, err := biz.orderRepository.FindOrders(ctx, userID, filter, paging)
	if err != nil {
		return nil, err
	}

	for i := range result {
		result[i].MaskDisplay()
	}
	return result, nil
}
