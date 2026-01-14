package business

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) UpdateAccount(ctx context.Context, id int, data *entity.AccountDataPatch) error {
	oldAccount, err := biz.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		return core.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	deletedImages := findDeletedImages(oldAccount.Images, data.Images)

	if len(deletedImages) > 0 {
		if err := biz.uploadComponent.DeleteFiles(ctx, deletedImages); err != nil {
		}
	}

	if err := biz.accountRepo.UpdateAccount(ctx, id, data); err != nil {
		return core.ErrInternal(err)
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
