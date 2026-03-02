package business

import (
	"context"
	"errors"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"gorm.io/gorm"
)

func (biz *business) GetAccount(ctx context.Context, id int32) (*entity.Account, error) {
	data, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, common.ErrCannotGetEntity(entity.Account{}.TableName(), err)
		}
		return nil, common.ErrInternal(err)
	}

	data.Mask()

	return data, nil
}

func (biz *business) GetAndLockAccount(ctx context.Context, id int32) (*entity.Account, error) {
	account, err := biz.accountRepo.GetAccountByIDForUpdate(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, common.ErrNotFound(entity.Account{}.TableName())
		}
		return nil, common.ErrDB(err)
	}

	if account.Status != entity.AccountStatusAvailable {
		return nil, common.ErrInvalidRequest(errors.New("tài khoản này hiện không khả dụng để giao dịch"))
	}

	return account, nil
}
