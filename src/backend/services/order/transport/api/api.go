package api

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/order/entity"
)

type Business interface {
	FindOrders(ctx context.Context, userID int32, filter *entity.OrderFilter, paging *common.Paging) ([]entity.Order, error)
	FindOrdersAdmin(ctx context.Context, userID int32, filter *entity.OrderFilter, paging *common.Paging) ([]entity.Order, error)
	GetOrder(ctx context.Context, id int32) (*entity.Order, error)
	CreateOrder(ctx context.Context, userID int32, data *entity.OrderCreate, ipAddress string) (*entity.Order, error)
	UpdateOrderStatus(ctx context.Context, id int32, status entity.OrderStatus, requesterId int32, ipAddress string) error
}

type api struct {
	business Business
}

func NewOrderAPI(business Business) *api {
	return &api{business: business}
}
