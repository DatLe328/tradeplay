package business

import (
	"context"
	"tradeplay/services/wallet/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) GetUserWallet(ctx context.Context, userId int) (*entity.Wallet, error) {
	wallet, err := biz.repo.GetWalletByUserID(ctx, userId, "VND")

	if err != nil {
		return nil, core.ErrEntityNotFound(wallet.TableName(), err)
	}

	return wallet, nil
}
