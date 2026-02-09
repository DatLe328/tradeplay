package business

import (
	"context"
	"errors"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	"tradeplay/services/order/entity"
)

func (biz *business) GetOrder(ctx context.Context, id int32) (*entity.Order, error) {
	order, err := biz.orderRepository.GetOrder(ctx, id)
	if err != nil {
		return nil, common.ErrCannotGetEntity(entity.Order{}.TableName(), err)
	}

	requester := common.GetRequester(ctx)
	uid, err := common.FromBase58(requester.GetSubject())
	userId := int32(uid.GetLocalID())

	if order.UserID != userId {
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:     userId,
			Action:     "GET_ORDER_FORBIDDEN",
			Payload:    auditEntity.JSONMap{"target_order_id": id, "owner_id": order.UserID},
			StatusCode: 403,
			ErrorMsg:   "User tried to access order belonging to another user",
			Method:     "GET",
			Path:       "/orders/:id",
		})
		return nil, common.ErrForbidden(errors.New("you have no permission to access this order"),
			"you have no permission to access this order")
	}

	order.MaskDisplay()

	return order, nil
}
