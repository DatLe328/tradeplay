package business

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (biz *business) GetAccount(ctx context.Context, id int) (*entity.Account, error) {
	data, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, core.ErrCannotGetEntity(entity.Account{}.TableName(), err)
		}
		return nil, core.ErrInternal(err)
	}

	data.Mask()

	return data, nil
}
