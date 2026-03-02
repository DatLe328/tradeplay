package business

import (
	"context"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
)

func (biz *business) CreateWallet(ctx context.Context, userID int32) error {
	existingWallet, err := biz.walletRepository.GetWalletByUserID(ctx, userID)
	if err == nil && existingWallet != nil {
		return nil
	}

	if err := biz.walletRepository.CreateWallet(ctx, userID); err != nil {
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:   userID,
			Action:   "CREATE_WALLET_FAILED",
			ErrorMsg: err.Error(),
		})
		return common.ErrInternal(err)
	}

	biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
		UserId: userID,
		Action: "CREATE_WALLET_SUCCESS",
	})

	return nil
}
