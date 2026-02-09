package business

import (
	"context"
	"fmt"
	"log"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	orderEntity "tradeplay/services/order/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"gorm.io/gorm"
)

func (biz *business) Deposit(
	ctx context.Context,
	tx *gorm.DB,
	userID int32,
	amount int64,
	refId string,
	description string,
	metaData *common.JSON,
) error {
	wallet, err := biz.walletRepository.GetWalletForUpdate(ctx, tx, userID)
	if err != nil {
		return fmt.Errorf("không tìm thấy ví người dùng: %w", err)
	}

	oldBalance := wallet.Balance
	newBalance := oldBalance + amount

	wallet.Balance = newBalance
	if err := tx.Save(wallet).Error; err != nil {
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
	// walletTx := &walletEntity.WalletTransaction{
	// 	WalletId:      wallet.UserID,
	// 	Amount:        amount,
	// 	BeforeBalance: oldBalance,
	// 	AfterBalance:  newBalance,
	// 	Type:          walletEntity.TxTypeDeposit,
	// 	RefType:       orderEntity.Order{}.TableName(),
	// 	RefId:         refId,
	// 	Description:   description,
	// 	Metadata:      metaData,
	// }

	if err := biz.walletRepository.CreateWalletTransaction(ctx, tx, walletTx); err != nil {
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
