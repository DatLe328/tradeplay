package business

import (
	"context"
	"fmt"
	"tradeplay/services/order/entity"
)

func (biz *business) MarkOrderAsPaid(ctx context.Context, orderID int32, amount int64, gateway string, refCode string) (*entity.Order, error) {
	order, err := biz.orderRepository.GetOrderForUpdate(ctx, orderID)
	if err != nil {
		return nil, err
	}

	if order.Status == entity.OrderStatusPaid || order.Status == entity.OrderStatusCompleted {
		return nil, nil
	}

	if int(amount) != int(order.TotalPrice) {
		return nil, fmt.Errorf("số tiền không khớp: nhận %v, cần %v", amount, order.TotalPrice)
	}

	if err := biz.orderRepository.UpdateOrderPaid(ctx, order.ID, gateway, refCode); err != nil {
		return nil, err
	}

	history := &entity.OrderHistory{
		OrderId:   order.ID,
		OldStatus: &order.Status,
		NewStatus: entity.OrderStatusPaid,
		Note:      fmt.Sprintf("Thanh toán thành công qua %s. Ref: %s", gateway, refCode),
	}
	if err := biz.orderRepository.CreateOrderHistory(ctx, history); err != nil {
		return nil, err
	}

	return order, nil
}

func (biz *business) MarkOrderAsCompleted(ctx context.Context, orderID int32, note string) error {
	order, err := biz.orderRepository.GetOrderForUpdate(ctx, orderID)
	if err != nil {
		return err
	}

	if order.Status == entity.OrderStatusCompleted {
		return nil
	}

	oldStatus := order.Status

	if err := biz.orderRepository.UpdateOrderCompleted(ctx, order.ID); err != nil {
		return err
	}

	history := &entity.OrderHistory{
		OrderId:   order.ID,
		OldStatus: &oldStatus,
		NewStatus: entity.OrderStatusCompleted,
		Note:      note,
	}
	if err := biz.orderRepository.CreateOrderHistory(ctx, history); err != nil {
		return err
	}

	return nil
}
