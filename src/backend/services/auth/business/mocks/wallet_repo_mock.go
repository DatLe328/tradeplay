package mocks

import (
	"context"
	walletEntity "tradeplay/services/wallet/entity"
)

type WalletRepositoryMock struct {
	CreateWalletFn func(ctx context.Context, wallet *walletEntity.Wallet) error
}

func (m *WalletRepositoryMock) CreateWallet(ctx context.Context, wallet *walletEntity.Wallet) error {
	return m.CreateWalletFn(ctx, wallet)
}
