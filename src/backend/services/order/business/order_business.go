package business

import (
	"context"
	"tradeplay/common"
	accountEntity "tradeplay/services/account/entity"
	auditEntity "tradeplay/services/audit/entity"
	"tradeplay/services/order/entity"
)

type orderRepository interface {
	common.TxManager

	// Order
	FindOrders(ctx context.Context, userID int32, filter *entity.OrderFilter, paging *common.Paging) ([]entity.Order, error)
	GetAllOrders(ctx context.Context, filter *entity.OrderFilter, paging *common.Paging) ([]entity.Order, error)
	GetOrder(ctx context.Context, id int32) (*entity.Order, error)
	GetOrderForUpdate(ctx context.Context, id int32) (*entity.Order, error)
	FindPendingDepositOrder(ctx context.Context, userID int32) (*entity.Order, error)

	CreateOrder(ctx context.Context, order *entity.Order) error

	UpdateOrderStatus(ctx context.Context, id int32, status entity.OrderStatus) error
	UpdateOrderPaid(ctx context.Context, id int32, method string, ref string) error
	UpdateOrderCompleted(ctx context.Context, id int32) error

	// Order History
	CreateOrderHistory(ctx context.Context, history *entity.OrderHistory) error
}

type auditRepository interface {
	PushAuditLog(ctx context.Context, entry *auditEntity.AuditLog)
}

type walletBusiness interface {
	Debit(ctx context.Context, userId int32, amount int64, refId string, description string) error
	Deposit(ctx context.Context, userId int32, amount int64, refId string, description string, metadata *common.JSON) error
}

type accountBusiness interface {
	GetAndLockAccount(ctx context.Context, id int32) (*accountEntity.Account, error)
	MarkAsSold(ctx context.Context, id, newOwnerID int32) error
}

type business struct {
	orderRepository orderRepository
	walletBusiness  walletBusiness
	accountBusiness accountBusiness
	auditRepository auditRepository
}

/*
- Internal: orderRepository, nil, nil, nil
*/
func NewOrderBusiness(
	repo orderRepository,
	accountBusiness accountBusiness,
	walletBusiness walletBusiness,
	auditRepo auditRepository,
) *business {
	return &business{
		orderRepository: repo,
		accountBusiness: accountBusiness,
		walletBusiness:  walletBusiness,
		auditRepository: auditRepo,
	}
}
