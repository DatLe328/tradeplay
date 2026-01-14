package business

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) DeleteAccount(ctx context.Context, id int) error {
	oldData, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		return core.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	if err := biz.orderRepo.DeleteOrdersByAccountId(ctx, id); err != nil {
		return core.ErrInternal(err)
	}

	if len(oldData.Images) > 0 {
		if err := biz.uploadComponent.DeleteFiles(ctx, oldData.Images); err != nil {
			return core.ErrInternal(err)
		}
	}

	if err := biz.accountRepo.DeleteAccount(ctx, id); err != nil {
		return core.ErrInternal(err)
	}

	return nil
}
