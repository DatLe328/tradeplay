package business

import (
	"context"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) GetUserByID(ctx context.Context, id int) (*entity.User, error) {
	user, err := biz.repo.GetUserByID(ctx, id)

	if err != nil {
		return nil, core.ErrCannotGetEntity(entity.User{}.TableName(), err)
	}

	return user, nil
}
