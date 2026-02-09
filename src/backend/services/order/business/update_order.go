package business

import (
	"context"
	"fmt"
	"time"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	orderEntity "tradeplay/services/order/entity"

	"gorm.io/gorm"
)

func (biz *business) UpdateOrderStatus(
	ctx context.Context,
	orderID int32,
	newStatus orderEntity.OrderStatus,
	requesterID int32,
	ipAddress string,
) error {
	db := biz.orderRepository.GetDB()

	// Set transaction timeout to 30 seconds for order update
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	return db.WithContext(ctxWithTimeout).Transaction(func(tx *gorm.DB) error {
		order, err := biz.orderRepository.GetOrderForUpdate(ctxWithTimeout, tx, orderID)
		if err != nil {
			return common.ErrCannotGetEntity(orderEntity.Order{}.TableName(), err)
		}

		oldStatus := order.Status
		if oldStatus == newStatus {
			return nil
		}

		if oldStatus == orderEntity.OrderStatusCompleted || oldStatus == orderEntity.OrderStatusPaid {
			return common.ErrInvalidRequest(fmt.Errorf("đơn hàng đã hoàn thành, không thể thay đổi trạng thái"))
		}

		if newStatus == orderEntity.OrderStatusCompleted || newStatus == orderEntity.OrderStatusPaid {

			if order.Type == orderEntity.OrderTypeDeposit {
				description := fmt.Sprintf("Nạp tiền qua đơn hàng #%d", order.ID)
				if err := biz.walletBusiness.Deposit(ctxWithTimeout, tx, order.UserID, order.TotalPrice, fmt.Sprintf("%d", order.ID), description, nil); err != nil {
					return fmt.Errorf("không thể cộng tiền vào ví: %w", err)
				}
			}

			if order.Type == orderEntity.OrderTypeBuyAcc && order.AccountID != nil {
				if err := biz.accountBusiness.MarkAsSold(ctxWithTimeout, tx, *order.AccountID, order.UserID); err != nil {
					return fmt.Errorf("không thể cập nhật trạng thái tài khoản: %w", err)
				}
			}
		}

		if err := biz.orderRepository.UpdateOrderStatus(ctxWithTimeout, tx, orderID, newStatus); err != nil {
			return common.ErrInternal(err)
		}

		history := &orderEntity.OrderHistory{
			OrderId:   orderID,
			OldStatus: &oldStatus,
			NewStatus: newStatus,
			Note:      fmt.Sprintf("Status changed from %v to %v", oldStatus, newStatus),
			ChangedBy: requesterID,
			IpAddress: ipAddress,
		}
		if err := biz.orderRepository.CreateOrderHistory(ctxWithTimeout, tx, history); err != nil {
			return common.ErrInternal(err)
		}

		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId: requesterID,
			Action: "UPDATE_ORDER_STATUS",
			Payload: auditEntity.JSONMap{
				"order_id":   orderID,
				"old_status": oldStatus,
				"new_status": newStatus,
			},
			StatusCode: 200,
			Method:     "PATCH",
			Path:       "/orders/:id/status",
			IpAddress:  ipAddress,
		})

		return nil
	})
}
