package business

import (
	"context"
	"time"
	"tradeplay/common"
	"tradeplay/pkg/crypto"
	"tradeplay/services/account/entity"
)

func (biz *business) CreateAccount(ctx context.Context, userID int32, data *entity.AccountDataCreation) (*int32, error) {
	if data.Price < 0 {
		return nil, common.ErrInvalidRequest(nil)
	}

	account := &entity.Account{
		OwnerId:       userID,
		CategoryId:    data.CategoryID,
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
		Version:   0,
	}

	ctxWithTimeout, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	err := biz.accountRepo.RunInTransaction(ctxWithTimeout, func(ctx context.Context) error {
		if err := biz.accountRepo.CreateAccount(ctx, account); err != nil {
			return err
		}

		encUser, _ := crypto.Encrypt(data.Username, biz.appSecretKey)
		encPass, _ := crypto.Encrypt(data.Password, biz.appSecretKey)
		encExtra, _ := crypto.Encrypt(data.ExtraData, biz.appSecretKey)

		accountInfo := &entity.AccountInfo{
			AccountId: account.ID,
			Username:  encUser,
			Password:  encPass,
			ExtraData: encExtra,
		}

		return biz.accountRepo.CreateAccountInfo(ctx, accountInfo)
	})

	if err != nil {
		return nil, common.ErrInternal(err)
	}

	return &account.ID, nil
}
