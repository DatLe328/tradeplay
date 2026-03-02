package business

import (
	"context"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	walletEntity "tradeplay/services/wallet/entity"
)

type walletRepository interface {
	common.TxManager
	GetWalletByUserID(ctx context.Context, userID int32) (*walletEntity.Wallet, error)
	GetWalletForUpdate(ctx context.Context, userID int32) (*walletEntity.Wallet, error)
	CreateWallet(ctx context.Context, userID int32) error
	UpdateWalletBalance(ctx context.Context, wallet *walletEntity.Wallet) error
	CreateWalletTransaction(ctx context.Context, data *walletEntity.WalletTransaction) error
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
