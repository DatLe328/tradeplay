package business

import (
	"context"
	"tradeplay/services/wallet/entity"

	"gorm.io/gorm"
)

type WalletRepository interface {
	GetDB() *gorm.DB
	GetWalletByUserID(ctx context.Context, userId int, currency string) (*entity.Wallet, error)
	GetWalletForUpdate(ctx context.Context, tx *gorm.DB, userId int, currency string) (*entity.Wallet, error)
	CreateWallet(ctx context.Context, wallet *entity.Wallet) error
	CreateWalletTransaction(ctx context.Context, tx *gorm.DB, data *entity.WalletTransaction) error
}

type business struct {
	repo WalletRepository
}

func NewBusiness(repo WalletRepository) *business {
	return &business{repo: repo}
}
