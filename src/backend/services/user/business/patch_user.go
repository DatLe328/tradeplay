package business

import (
	"context"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) PatchUserProfile(
	ctx context.Context,
	data *entity.UserDataPatch,
) error {
	if err := data.Validate(); err != nil {
		return core.ErrInvalidRequest(err)
	}

	requester := core.GetRequester(ctx)

	uid, _ := core.FromBase58(requester.GetSubject())
	requesterID := int(uid.GetLocalID())

	updates := data.ToUpdateMap()
	if err := biz.repo.PatchUserByID(ctx, requesterID, updates); err != nil {
		return core.ErrCannotUpdateEntity(entity.User{}.TableName(), err)
	}

	return nil
}
