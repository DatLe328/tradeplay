package business

import (
	"context"
	accountEntity "tradeplay/services/account/entity"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *entity.Order) error
	ListOrders(ctx context.Context, userId int, paging *core.Paging) ([]entity.Order, error)
	ListAllOrders(ctx context.Context, paging *core.Paging) ([]entity.Order, error)
	GetOrder(ctx context.Context, id int) (*entity.Order, error)
	UpdateOrderStatus(ctx context.Context, id int, status entity.OrderStatus) error
}

type AccountRepository interface {
	GetAccountByID(ctx context.Context, id int) (*accountEntity.Account, error)
	UpdateAccount(ctx context.Context, id int, data *accountEntity.AccountDataPatch) error
}

type business struct {
	repo        OrderRepository
	accountRepo AccountRepository
}

func NewBusiness(repo OrderRepository, accountRepo AccountRepository) *business {
	return &business{repo: repo, accountRepo: accountRepo}
}
