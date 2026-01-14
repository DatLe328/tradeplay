package business

import (
	"context"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) GetUserProfile(ctx context.Context) (*entity.User, error) {
	requester := core.GetRequester(ctx)

	uid, _ := core.FromBase58(requester.GetSubject())
	requesterID := int(uid.GetLocalID())

	user, err := biz.repo.GetUserByID(ctx, requesterID)

	if err != nil {
		return nil, core.ErrCannotGetEntity(entity.User{}.TableName(), err)
	}

	return user, nil
}
