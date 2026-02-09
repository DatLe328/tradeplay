package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/user/entity"
)

func (biz *business) GetUserByID(ctx context.Context, id int32) (*entity.User, error) {
	user, err := biz.repo.GetUserByID(ctx, id)

	if err != nil {
		return nil, common.ErrCannotGetEntity(entity.User{}.TableName(), err)
	}

	return user, nil
}
