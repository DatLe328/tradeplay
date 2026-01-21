package business

import (
	"context"
	"log"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (biz *business) UpdateAccount(ctx context.Context, id int, data *entity.AccountDataUpdate) error {
	oldAccount, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		return core.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	if data.Images != nil {
		deletedImages := findDeletedImages(oldAccount.Images, data.Images)

		if len(deletedImages) > 0 {
			go func(ctx context.Context, images []string) {
				err := biz.uploadComponent.DeleteFiles(context.Background(), images)
				if err != nil {
					log.Printf("Failed to delete background images: %v", err)
				}
			}(ctx, deletedImages)
		}
	}

	db := biz.accountRepo.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		if err := biz.accountRepo.UpdateAccount(ctx, tx, id, data); err != nil {
			return err
		}

		if data.Username != nil || data.Password != nil || data.ExtraData != nil {
			infoUpdate := &entity.AccountInfo{}

			if data.Username != nil {
				encUser, err := common.Encrypt(*data.Username, biz.appSecretKey)
				if err != nil {
					return core.ErrInternal(err)
				}
				infoUpdate.Username = encUser
			}

			if data.Password != nil {
				encPass, err := common.Encrypt(*data.Password, biz.appSecretKey)
				if err != nil {
					return core.ErrInternal(err)
				}
				infoUpdate.Password = encPass
			}

			if data.ExtraData != nil {
				encExtra, err := common.Encrypt(*data.ExtraData, biz.appSecretKey)
				if err != nil {
					return core.ErrInternal(err)
				}
				infoUpdate.ExtraData = encExtra
			}

			if err := biz.accountRepo.UpdateAccountInfo(ctx, tx, id, infoUpdate); err != nil {
				return err
			}
		}

		return nil
	})
}

func findDeletedImages(oldImages, newImages []string) []string {
	var deleted []string

	oldMap := make(map[string]bool)
	for _, img := range oldImages {
		oldMap[img] = true
	}

	newMap := make(map[string]bool)
	for _, img := range newImages {
		newMap[img] = true
	}

	for img := range oldMap {
		if !newMap[img] {
			deleted = append(deleted, img)
		}
	}

	return deleted
}
