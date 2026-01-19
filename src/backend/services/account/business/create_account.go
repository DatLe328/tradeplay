package business

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) CreateAccount(ctx context.Context, userId int, data *entity.AccountDataCreation) (*int, error) {
	if data.Price < 0 {
		return nil, core.ErrInvalidRequest(nil)
	}

	account := &entity.Account{
		OwnerId:       userId,
		GameName:      data.GameName,
		Title:         data.Title,
		Description:   data.Description,
		Price:         data.Price,
		OriginalPrice: data.OriginalPrice,
		Thumbnail:     data.Thumbnail,
		Images:        data.Images,
		Attributes:    data.Attributes,
		Features:      data.Features,

		Status:    entity.AccountStatusAvailable,
		ViewCount: 0,
	}

	if err := biz.accountRepo.CreateAccount(ctx, account); err != nil {
		return nil, core.ErrInternal(err)
	}

	return &account.Id, nil
}
