package business

import (
	"context"
	accountEntity "tradeplay/services/account/entity"
	orderEntity "tradeplay/services/order/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"gorm.io/gorm"
)

type WalletRepository interface {
	GetDB() *gorm.DB
	GetWalletByUserID(ctx context.Context, userId int, currency string) (*walletEntity.Wallet, error)
	GetWalletForUpdate(ctx context.Context, tx *gorm.DB, userId int, currency string) (*walletEntity.Wallet, error)
	CreateWallet(ctx context.Context, wallet *walletEntity.Wallet) error
	CreateWalletTransaction(ctx context.Context, tx *gorm.DB, data *walletEntity.WalletTransaction) error
}

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *orderEntity.Order) error
	GetOrder(ctx context.Context, id int) (*orderEntity.Order, error)
	UpdateOrderStatus(ctx context.Context, id int, status orderEntity.OrderStatus) error
	GetOrderByUserAndAccount(ctx context.Context, userId, accountId int) (*orderEntity.Order, error)
	CreateOrderHistory(ctx context.Context, history *orderEntity.OrderHistory) error
	UpdateOrderPaid(ctx context.Context, id int, method string, ref string) error
}

type AccountRepository interface {
	CreateAccount(ctx context.Context, data *accountEntity.Account) error
	UpdateAccount(ctx context.Context, id int, data *accountEntity.AccountDataUpdate) error
	GetAccountByID(ctx context.Context, id int) (*accountEntity.Account, error)
}

type business struct {
	walletRepo  WalletRepository
	orderRepo   OrderRepository
	accountRepo AccountRepository
}

func NewBusiness(walletRepo WalletRepository, orderRepo OrderRepository, accountRepo AccountRepository) *business {
	return &business{
		walletRepo:  walletRepo,
		orderRepo:   orderRepo,
		accountRepo: accountRepo,
	}
}
