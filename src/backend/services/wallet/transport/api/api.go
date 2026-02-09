package api

import (
	"context"
	"tradeplay/services/wallet/entity"
)

type business interface {
	GetUserWallet(ctx context.Context, userID int32) (*entity.Wallet, error)
}

type api struct {
	business business
}

func NewWalletAPI(business business) *api {
	return &api{
		business: business,
	}
}
