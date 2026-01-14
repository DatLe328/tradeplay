package business

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) CreateAccount(ctx context.Context, data *entity.Account) error {
	if data.Price < 0 {
		return core.ErrInvalidRequest(nil)
	}

	if err := biz.accountRepo.CreateAccount(ctx, data); err != nil {
		return core.ErrInternal(err)
	}

	return nil
}
