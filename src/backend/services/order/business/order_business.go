package business

import (
	"context"
	accountEntity "tradeplay/services/account/entity"
	"tradeplay/services/order/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

type OrderRepository interface {
	GetDB() *gorm.DB

	CreateOrder(ctx context.Context, order *entity.Order) error
	ListOrders(ctx context.Context, userId int, filter *entity.OrderFilter, paging *core.Paging) ([]entity.Order, error)
	ListAllOrders(ctx context.Context, filter *entity.OrderFilter, paging *core.Paging) ([]entity.Order, error)
	GetOrder(ctx context.Context, id int) (*entity.Order, error)
	UpdateOrderStatus(ctx context.Context, tx *gorm.DB, id int, status entity.OrderStatus) error
	GetOrderByUserAndAccount(ctx context.Context, userId, accountId int) (*entity.Order, error)

	CreateOrderHistory(ctx context.Context, tx *gorm.DB, history *entity.OrderHistory) error
	UpdateOrderPaid(ctx context.Context, tx *gorm.DB, id int, method string, ref string) error
	GetOrderForUpdate(ctx context.Context, tx *gorm.DB, id int) (*entity.Order, error)
}

type AccountRepository interface {
	GetAccountByID(ctx context.Context, id int) (*accountEntity.Account, error)
	UpdateAccount(ctx context.Context, tx *gorm.DB, id int, data *accountEntity.AccountDataUpdate) error
}

type WalletRepository interface {
	GetWalletByUserID(ctx context.Context, userId int, currency string) (*walletEntity.Wallet, error)
	GetWalletForUpdate(ctx context.Context, tx *gorm.DB, userId int, currency string) (*walletEntity.Wallet, error)
	CreateWalletTransaction(ctx context.Context, tx *gorm.DB, data *walletEntity.WalletTransaction) error
	GetDB() *gorm.DB
}

type business struct {
	repo        OrderRepository
	accountRepo AccountRepository
	walletRepo  WalletRepository
}

func NewBusiness(repo OrderRepository, accountRepo AccountRepository, walletRepo WalletRepository) *business {
	return &business{repo: repo, accountRepo: accountRepo, walletRepo: walletRepo}
}
