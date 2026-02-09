package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/user/entity"
)

func (biz *business) PatchUserProfile(
	ctx context.Context,
	data *entity.UserUpdateDTO,
) error {
	if err := data.Validate(); err != nil {
		return common.ErrInvalidRequest(err)
	}

	requester := common.GetRequester(ctx)

	uid, _ := common.FromBase58(requester.GetSubject())
	requesterID := int32(uid.GetLocalID())

	updates := data.ToUpdateMap()
	if err := biz.repo.PatchUserByID(ctx, requesterID, updates); err != nil {
		return common.ErrCannotUpdateEntity(entity.User{}.TableName(), err)
	}

	return nil
}
