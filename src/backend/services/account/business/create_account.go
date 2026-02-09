package business

import (
	"context"
	"time"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"gorm.io/gorm"
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

	db := biz.accountRepo.GetDB()

	ctxWithTimeout, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	err := db.WithContext(ctxWithTimeout).Transaction(func(tx *gorm.DB) error {
		if err := biz.accountRepo.CreateAccount(ctxWithTimeout, tx, account); err != nil {
			return err
		}

		encUser, _ := common.Encrypt(data.Username, biz.appSecretKey)
		encPass, _ := common.Encrypt(data.Password, biz.appSecretKey)
		encExtra, _ := common.Encrypt(data.ExtraData, biz.appSecretKey)

		accountInfo := &entity.AccountInfo{
			AccountId: account.ID,
			Username:  encUser,
			Password:  encPass,
			ExtraData: encExtra,
		}

		if err := biz.accountRepo.CreateAccountInfo(ctxWithTimeout, tx, accountInfo); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, common.ErrInternal(err)
	}

	return &account.ID, nil
}
