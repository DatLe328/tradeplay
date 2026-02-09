package business

import (
	"context"
	"errors"
	"tradeplay/common"
	"tradeplay/services/account/entity"
)

func (biz *business) DeleteAccount(ctx context.Context, id int32) error {
	oldData, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		return common.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	if oldData.Status == entity.AccountStatusSold {
		return common.ErrInvalidRequest(errors.New("cannot delete a sold account"))
	}

	if err := biz.orderRepo.DeleteOrdersByAccountId(ctx, id); err != nil {
		return common.ErrInternal(err)
	}

	if len(oldData.Images) > 0 {
		if err := biz.uploadComponent.DeleteFiles(ctx, oldData.Images); err != nil {
		}
	}

	if err := biz.accountRepo.DeleteAccount(ctx, id); err != nil {
		return common.ErrInternal(err)
	}

	return nil
}
