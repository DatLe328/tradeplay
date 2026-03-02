package business

import (
	"context"
	"log"
	"time"
	"tradeplay/common"
	"tradeplay/pkg/crypto"
	"tradeplay/services/account/entity"
)

func (biz *business) UpdateAccount(ctx context.Context, id int32, data *entity.AccountDataUpdate) error {
	oldAccount, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		return common.ErrCannotGetEntity(entity.Account{}.TableName(), err)
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

	// Set transaction timeout to 30 seconds for account update
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	return biz.accountRepo.RunInTransaction(ctxWithTimeout, func(ctx context.Context) error {
		if err := biz.accountRepo.UpdateAccount(ctx, id, data, data.Version); err != nil {
			return err
		}

		if data.Username != nil || data.Password != nil || data.ExtraData != nil {
			infoUpdate := &entity.AccountInfo{}

			if data.Username != nil {
				encUser, err := crypto.Encrypt(*data.Username, biz.appSecretKey)
				if err != nil {
					return common.ErrInternal(err)
				}
				infoUpdate.Username = encUser
			}

			if data.Password != nil {
				encPass, err := crypto.Encrypt(*data.Password, biz.appSecretKey)
				if err != nil {
					return common.ErrInternal(err)
				}
				infoUpdate.Password = encPass
			}

			if data.ExtraData != nil {
				encExtra, err := crypto.Encrypt(*data.ExtraData, biz.appSecretKey)
				if err != nil {
					return common.ErrInternal(err)
				}
				infoUpdate.ExtraData = encExtra
			}

			if err := biz.accountRepo.UpdateAccountInfo(ctx, id, infoUpdate); err != nil {
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
