package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) GetAccountCredentials(ctx context.Context, requesterId int, accountId int) (*entity.AccountInfo, error) {
	acc, err := biz.accountRepo.GetAccountByID(ctx, accountId)
	if err != nil {
		return nil, core.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	isAuthorized := false

	if acc.OwnerId == requesterId {
		isAuthorized = true
	}

	if !isAuthorized {
		hasBought, err := biz.orderRepo.HasUserPurchasedAccount(ctx, requesterId, accountId)
		if err == nil && hasBought {
			isAuthorized = true
		}
	}

	if !isAuthorized {
		return nil, core.ErrUnauthorized(nil, "Bạn không có quyền xem thông tin tài khoản này", "FORBIDDEN")
	}

	info, err := biz.accountRepo.GetAccountInfoByAccountID(ctx, accountId)
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	decUser, err := common.Decrypt(info.Username, biz.appSecretKey)
	if err != nil {
		decUser = "[Error Decrypting]"
	}
	info.Username = decUser

	decPass, err := common.Decrypt(info.Password, biz.appSecretKey)
	if err != nil {
		decPass = "[Error Decrypting]"
	}
	info.Password = decPass

	decExtra, err := common.Decrypt(info.ExtraData, biz.appSecretKey)
	if err != nil {
		decExtra = ""
	}
	info.ExtraData = decExtra

	return info, nil
}
