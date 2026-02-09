package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/wallet/entity"
)

func (biz *business) GetUserWallet(ctx context.Context, userID int32) (*entity.Wallet, error) {
	wallet, err := biz.walletRepository.GetWalletByUserID(ctx, userID)

	if err != nil {
		return nil, common.ErrEntityNotFound(wallet.TableName(), err)
	}

	return wallet, nil
}
