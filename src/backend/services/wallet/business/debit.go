package business

import (
	"context"
	"errors"
	"fmt"
	"tradeplay/common"
	"tradeplay/services/wallet/entity"
)

func (biz *business) Debit(
	ctx context.Context,
	userID int32,
	amount int64,
	refId string,
	description string,
) error {
	wallet, err := biz.walletRepository.GetWalletForUpdate(ctx, userID)
	if err != nil {
		return fmt.Errorf("không tìm thấy ví người dùng: %w", err)
	}

	if wallet.Balance < amount {
		return common.ErrInvalidRequest(errors.New("số dư ví không đủ để thực hiện giao dịch"))
	}

	oldBalance := wallet.Balance
	newBalance := oldBalance - amount

	wallet.Balance = newBalance
	if err := biz.walletRepository.UpdateWalletBalance(ctx, wallet); err != nil {
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

	if err := biz.walletRepository.CreateWalletTransaction(ctx, walletTx); err != nil {
		return common.ErrDB(err)
	}

	return nil
}
