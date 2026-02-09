package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/user/entity"
)

func (biz *business) CreateUser(ctx context.Context, data *entity.UserCreateDTO) (newUserId int32, err error) {
	if err := data.Validate(); err != nil {
		return 0, common.ErrInvalidRequest(err)
	}
	userId, err := biz.repo.CreateUser(ctx, data)
	if err != nil {
		return 0, common.ErrCannotCreateEntity(entity.User{}.TableName(), err)
	}
	return userId, nil
}
