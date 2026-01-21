package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
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

	db := biz.accountRepo.GetDB()

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := biz.accountRepo.CreateAccount(ctx, tx, account); err != nil {
			return err
		}

		encUser, err := common.Encrypt(data.Username, biz.appSecretKey)
		if err != nil {
			return core.ErrInternal(err)
		}
		encPass, err := common.Encrypt(data.Password, biz.appSecretKey)
		if err != nil {
			return core.ErrInternal(err)
		}

		encExtra, err := common.Encrypt(data.ExtraData, biz.appSecretKey)
		if err != nil {
			return core.ErrInternal(err)
		}
		accountInfo := &entity.AccountInfo{
			AccountId: account.Id,
			Username:  encUser,
			Password:  encPass,
			ExtraData: encExtra,
		}

		if err := biz.accountRepo.CreateAccountInfo(ctx, tx, accountInfo); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, core.ErrInternal(err)
	}

	return &account.Id, nil
}
