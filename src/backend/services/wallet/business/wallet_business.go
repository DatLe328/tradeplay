package business

import (
	"context"
	auditEntity "tradeplay/services/audit/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"gorm.io/gorm"
)

type walletRepository interface {
	GetDB() *gorm.DB
	GetWalletByUserID(ctx context.Context, userID int32) (*walletEntity.Wallet, error)
	GetWalletForUpdate(ctx context.Context, tx *gorm.DB, userID int32) (*walletEntity.Wallet, error)
	CreateWallet(ctx context.Context, userID int32) error
	CreateWalletTransaction(ctx context.Context, tx *gorm.DB, data *walletEntity.WalletTransaction) error
}

type auditRepository interface {
	PushAuditLog(ctx context.Context, log *auditEntity.AuditLog)
}

type business struct {
	walletRepository walletRepository
	auditRepository  auditRepository
}

func NewWalletBusiness(
	walletRepository walletRepository,
	auditRepository auditRepository,
) *business {
	return &business{
		walletRepository: walletRepository,
		auditRepository:  auditRepository,
	}
}
