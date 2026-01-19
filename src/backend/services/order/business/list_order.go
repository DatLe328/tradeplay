package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) ListOrders(ctx context.Context, userId int, filter *entity.OrderFilter, paging *core.Paging) ([]entity.Order, error) {
	if common.IsAdmin(ctx) {
		results, err := biz.repo.ListAllOrders(ctx, filter, paging)
		if err != nil {
			return nil, err
		}

		for i := range results {
			results[i].Mask()
		}
		return results, nil
	} else {
		result, err := biz.repo.ListOrders(ctx, userId, filter, paging)
		if err != nil {
			return nil, err
		}

		for i := range result {
			result[i].Mask()
		}
		return result, nil
	}
}
