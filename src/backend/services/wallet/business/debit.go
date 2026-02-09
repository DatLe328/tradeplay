package business

import (
	"context"
	"errors"
	"fmt"
	"tradeplay/common"
	"tradeplay/services/wallet/entity"

	"gorm.io/gorm"
)

func (biz *business) Debit(
	ctx context.Context,
	tx *gorm.DB,
	userID int32,
	amount int64,
	refId string,
	description string,
) error {
	wallet, err := biz.walletRepository.GetWalletForUpdate(ctx, tx, userID)
	if err != nil {
		return fmt.Errorf("không tìm thấy ví người dùng: %w", err)
	}

	if wallet.Balance < amount {
		return common.ErrInvalidRequest(errors.New("số dư ví không đủ để thực hiện giao dịch"))
	}

	oldBalance := wallet.Balance
	newBalance := oldBalance - amount

	wallet.Balance = newBalance
	if err := tx.Save(wallet).Error; err != nil {
		return common.ErrDB(err)
	}

	walletTx := entity.NewWalletTransaction(
		wallet.ID,
		-int64(amount),
		oldBalance,
		newBalance,
		entity.TxTypeWithdraw,
		"order",
		refId,
		description,
		nil,
	)

	if err := biz.walletRepository.CreateWalletTransaction(ctx, tx, walletTx); err != nil {
		return common.ErrDB(err)
	}

	return nil
}
