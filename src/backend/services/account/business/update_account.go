package business

import (
	"context"
	"log"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) UpdateAccount(ctx context.Context, id int, data *entity.AccountDataUpdate) error {
	oldAccount, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		return core.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	// if oldAccount.Status == entity.AccountStatusSold || oldAccount.Status == entity.AccountStatusDeleted {
	// 	return core.ErrInvalidRequest(errors.New("warning: updating a sold or deleted account is restricted"))
	// }

	if err := biz.accountRepo.UpdateAccount(ctx, id, data); err != nil {
		return core.ErrInternal(err)
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

	return nil
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
