package business

import (
	"context"
	"fmt"
	"log"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	orderEntity "tradeplay/services/order/entity"
	walletEntity "tradeplay/services/wallet/entity"
)

func (biz *business) Deposit(
	ctx context.Context,
	userID int32,
	amount int64,
	refId string,
	description string,
	metaData *common.JSON,
) error {
	wallet, err := biz.walletRepository.GetWalletForUpdate(ctx, userID)
	if err != nil {
		return fmt.Errorf("không tìm thấy ví người dùng: %w", err)
	}

	oldBalance := wallet.Balance
	newBalance := oldBalance + amount

	wallet.Balance = newBalance
	if err := biz.walletRepository.UpdateWalletBalance(ctx, wallet); err != nil {
		return err
	}

	walletTx := walletEntity.NewWalletTransaction(
		wallet.ID,
		int64(amount),
		oldBalance,
		newBalance,
		walletEntity.TxTypeDeposit,
		orderEntity.Order{}.TableName(),
		refId,
		description,
		metaData,
	)

	if err := biz.walletRepository.CreateWalletTransaction(ctx, walletTx); err != nil {
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:   userID,
			Action:   "WALLET_DEPOSIT_FAILED",
			ErrorMsg: err.Error(),
		})
		log.Printf("failed to create wallet transaction: %v", err)
		return err
	}

	return nil
}
