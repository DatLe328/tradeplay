package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"
	auditEntity "tradeplay/services/audit/entity"
)

func (biz *business) GetAccountCredentials(ctx context.Context, requesterID int32, accountId int32) (*entity.AccountCredentialsDTO, error) {
	acc, err := biz.accountRepo.GetAccountByID(ctx, accountId)
	if err != nil {
		return nil, common.ErrCannotGetEntity(entity.Account{}.TableName(), err)
	}

	canAccess := false

	if acc.OwnerId == requesterID {
		canAccess = true
	}

	if !canAccess {
		hasPurchased, err := biz.orderRepo.HasUserPurchasedAccount(ctx, requesterID, accountId)
		if err == nil && hasPurchased {
			canAccess = true
		}
	}

	if !canAccess {
		go func() {
			biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
				UserId:     requesterID,
				Action:     "GET_ACCOUNT_CREDENTIALS_DENIED",
				ErrorMsg:   "User attempted to access credentials of account they don't own or haven't purchased",
				StatusCode: 403,
			})
		}()
		return nil, common.ErrForbidden(nil, "You don't have permission to access this account's credentials")
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

	go func() {
		biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:     requesterID,
			Action:     "GET_ACCOUNT_CREDENTIALS_SUCCESS",
			StatusCode: 200,
		})
	}()

	return info.ToDTO(), nil
}
