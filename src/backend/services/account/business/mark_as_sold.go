package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"
)

func (biz *business) MarkAsSold(
	ctx context.Context,
	id int32,
	newOwnerId int32,
) error {
	account, err := biz.accountRepo.GetAccountByIDForUpdate(ctx, id)
	if err != nil {
		return common.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	statusSold := entity.AccountStatusSold
	dataUpdate := &entity.AccountDataUpdate{
		Status:  &statusSold,
		OwnerID: &newOwnerId,
	}

	if err := biz.accountRepo.UpdateAccount(ctx, id, dataUpdate, account.Version); err != nil {
		return common.ErrDB(err)
	}

	return nil
}
