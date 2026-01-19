package api

import (
	"context"
	"tradeplay/services/order/entity"

	"github.com/DatLe328/service-context/core"
)

type Business interface {
	CreateOrder(ctx context.Context, userId int, data *entity.OrderCreate, ipAddress string) (*entity.Order, error)
	ListOrders(ctx context.Context, userId int, filter *entity.OrderFilter, paging *core.Paging) ([]entity.Order, error)
	GetOrder(ctx context.Context, id int) (*entity.Order, error)
	UpdateOrderStatus(ctx context.Context, id int, status entity.OrderStatus, requesterId int, ipAddress string) error
}

type api struct {
	business Business
}

func NewOrderAPI(business Business) *api {
	return &api{business: business}
}
