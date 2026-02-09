package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"
)

func (biz *business) AdminGetAccountCredentials(
	ctx context.Context,
	accountId int32,
) (*entity.AccountCredentialsDTO, error) {
	_, err := biz.accountRepo.GetAccountByID(ctx, accountId)
	if err != nil {
		return nil, common.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	info, err := biz.accountRepo.GetAccountInfoByAccountID(ctx, accountId)
	if err != nil {
		return nil, common.ErrInternal(err)
	}

	decryptField := func(cipherText string) string {
		plain, err := common.Decrypt(cipherText, biz.appSecretKey)
		if err != nil {
			return "[Error Decrypting]"
		}
		return plain
	}

	info.Username = decryptField(info.Username)
	info.Password = decryptField(info.Password)
	info.Email = decryptField(info.Email)
	info.ExtraData = decryptField(info.ExtraData)

	return info.ToDTO(), nil
}
