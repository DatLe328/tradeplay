package api

import (
	"context"
	"tradeplay/services/wallet/entity"
)

type business interface {
	GetUserWallet(ctx context.Context, userId int) (*entity.Wallet, error)
}

type api struct {
	business business
}

func NewWalletAPI(business business) *api {
	return &api{
		business: business,
	}
}
