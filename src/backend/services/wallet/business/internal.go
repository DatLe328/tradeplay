package business

import (
	"context"
)

func (biz *business) CreateWalletInternal(ctx context.Context, userID int32) error {
	return biz.walletRepository.CreateWallet(ctx, userID)
}
