package business

import (
	"context"
	"fmt"
	"tradeplay/services/order/entity"

	"gorm.io/gorm"
)

func (biz *business) MarkOrderAsPaid(ctx context.Context, tx *gorm.DB, orderID int32, amount int64, gateway string, refCode string) (*entity.Order, error) {
	order, err := biz.orderRepository.GetOrderForUpdate(ctx, tx, orderID)
	if err != nil {
		return nil, err
	}

	if order.Status == entity.OrderStatusPaid || order.Status == entity.OrderStatusCompleted {
		return nil, nil
	}

	if int(amount) != int(order.TotalPrice) {
		return nil, fmt.Errorf("số tiền không khớp: nhận %v, cần %v", amount, order.TotalPrice)
	}

	if err := biz.orderRepository.UpdateOrderPaid(ctx, tx, order.ID, gateway, refCode); err != nil {
		return nil, err
	}

	history := &entity.OrderHistory{
		OrderId:   order.ID,
		OldStatus: &order.Status,
		NewStatus: entity.OrderStatusPaid,
		Note:      fmt.Sprintf("Thanh toán thành công qua %s. Ref: %s", gateway, refCode),
	}
	if err := biz.orderRepository.CreateOrderHistory(ctx, tx, history); err != nil {
		return nil, err
	}

	return order, nil
}

func (biz *business) MarkOrderAsCompleted(ctx context.Context, tx *gorm.DB, orderID int32, note string) error {
	order, err := biz.orderRepository.GetOrderForUpdate(ctx, tx, orderID)
	if err != nil {
		return err
	}

	if order.Status == entity.OrderStatusCompleted {
		return nil
	}

	oldStatus := order.Status

	if err := biz.orderRepository.UpdateOrderCompleted(ctx, tx, order.ID); err != nil {
		return err
	}

	history := &entity.OrderHistory{
		OrderId:   order.ID,
		OldStatus: &oldStatus,
		NewStatus: entity.OrderStatusCompleted,
		Note:      note,
	}
	if err := biz.orderRepository.CreateOrderHistory(ctx, tx, history); err != nil {
		return err
	}

	return nil
}
