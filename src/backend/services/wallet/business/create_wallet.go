package business

import (
	"context"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
)

func (biz *business) CreateWallet(ctx context.Context, userID int32) error {
	tx := biz.walletRepository.GetDB().Begin()

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	existingWallet, err := biz.walletRepository.GetWalletByUserID(ctx, userID)
	if err == nil && existingWallet != nil {
		tx.Rollback()
		return nil
	}

	if err := biz.walletRepository.CreateWallet(ctx, userID); err != nil {
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:   userID,
			Action:   "CREATE_WALLET_FAILED",
			ErrorMsg: err.Error(),
		})

		tx.Rollback()
		return common.ErrInternal(err)
	}

	if err := tx.Commit().Error; err != nil {
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:   userID,
			Action:   "CREATE_WALLET_COMMIT_FAILED",
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
