package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"gorm.io/gorm"
)

func (biz *business) MarkAsSold(
	ctx context.Context,
	tx *gorm.DB,
	id int32,
	newOwnerId int32,
) error {
	account, err := biz.accountRepo.GetAccountByIDForUpdate(ctx, tx, id)
	if err != nil {
		return common.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	statusSold := entity.AccountStatusSold
	dataUpdate := &entity.AccountDataUpdate{
		Status:  &statusSold,
		OwnerID: &newOwnerId,
	}

	if err := biz.accountRepo.UpdateAccount(ctx, tx, id, dataUpdate, account.Version); err != nil {
		return common.ErrDB(err)
	}

	return nil
}
