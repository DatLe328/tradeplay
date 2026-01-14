package business

import (
	"context"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) CreateUser(ctx context.Context, data *entity.UserDataCreation) (newUserId int, err error) {
	if err := data.Validate(); err != nil {
		return 0, core.ErrInvalidRequest(err)
	}
	userId, err := biz.repo.CreateUser(ctx, data)
	if err != nil {
		return 0, core.ErrCannotCreateEntity(entity.User{}.TableName(), err)
	}
	return userId, nil
}
