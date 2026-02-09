package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/order/entity"
)

func (biz *business) FindOrdersAdmin(
	ctx context.Context,
	userID int32,
	filter *entity.OrderFilter,
	paging *common.Paging,
) ([]entity.Order, error) {
	// Need to check if userID has admin privileges
	results, err := biz.orderRepository.GetAllOrders(ctx, filter, paging)
	if err != nil {
		return nil, err
	}

	for i := range results {
		results[i].MaskDisplay()
	}
	return results, nil
}
