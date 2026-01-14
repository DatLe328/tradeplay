package business

import (
	"context"
	"errors"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) GetOrder(ctx context.Context, id int) (*entity.Order, error) {
	order, err := biz.repo.GetOrder(ctx, id)
	if err != nil {
		return nil, core.ErrCannotGetEntity(entity.Order{}.TableName(), err)
	}

	requester := core.GetRequester(ctx)
	uid, err := core.FromBase58(requester.GetSubject())
	userId := int(uid.GetLocalID())

	if order.UserId != userId {
		return nil, core.ErrForbidden(errors.New("you have no permission to access this order"),
			"you have no permission to access this order")
	}

	order.Mask()

	return order, nil
}
