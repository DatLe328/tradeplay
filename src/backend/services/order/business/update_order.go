package business

import (
	"context"
	"fmt"
	accountEntity "tradeplay/services/account/entity"
	orderEntity "tradeplay/services/order/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (biz *business) UpdateOrderStatus(
	ctx context.Context,
	orderId int,
	newStatus orderEntity.OrderStatus,
	requesterId int,
	ipAddress string,
) error {
	db := biz.walletRepo.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		order, err := biz.repo.GetOrderForUpdate(ctx, tx, orderId)
		if err != nil {
			return core.ErrCannotGetEntity(orderEntity.Order{}.TableName(), err)
		}

		oldStatus := order.Status
		if oldStatus == newStatus {
			return nil
		}

		if oldStatus == orderEntity.OrderStatusCompleted || oldStatus == orderEntity.OrderStatusPaid {
			return core.ErrInvalidRequest(fmt.Errorf("đơn hàng đã hoàn thành, không thể thay đổi trạng thái"))
		}

		if newStatus == orderEntity.OrderStatusCompleted || newStatus == orderEntity.OrderStatusPaid {

			if order.Type == orderEntity.OrderTypeDeposit {
				wallet, err := biz.walletRepo.GetWalletForUpdate(ctx, tx, order.UserId, "VND")
				if err != nil {
					return fmt.Errorf("wallet not found: %v", err)
				}

				newBalance := wallet.Balance + order.TotalPrice
				wallet.Balance = newBalance

				if err := tx.Save(wallet).Error; err != nil {
					return err
				}

				walletTx := &walletEntity.WalletTransaction{
					SQLModel:      core.NewSQLModel(),
					WalletId:      wallet.Id,
					Amount:        order.TotalPrice,
					BeforeBalance: wallet.Balance - order.TotalPrice,
					AfterBalance:  newBalance,
					Type:          walletEntity.TxTypeDeposit,
					RefType:       "order",
					RefId:         fmt.Sprintf("%d", order.Id),
					Description:   fmt.Sprintf("Nạp tiền qua đơn hàng #%d", order.Id),
				}

				if err := biz.walletRepo.CreateWalletTransaction(ctx, tx, walletTx); err != nil {
					return err
				}
			}

			if order.Type == orderEntity.OrderTypeBuyAcc && order.AccountId != nil {
				statusSold := accountEntity.AccountStatusSold
				data := accountEntity.AccountDataUpdate{Status: &statusSold}
				if err := biz.accountRepo.UpdateAccount(ctx, tx, *order.AccountId, &data); err != nil {
					return core.ErrInternal(err)
				}
			}
		}

		if err := biz.repo.UpdateOrderStatus(ctx, tx, orderId, newStatus); err != nil {
			return core.ErrInternal(err)
		}

		history := &orderEntity.OrderHistory{
			OrderId:   orderId,
			OldStatus: &oldStatus,
			NewStatus: newStatus,
			Note:      fmt.Sprintf("Status changed from %v to %v", oldStatus, newStatus),
			ChangedBy: requesterId,
			IpAddress: ipAddress,
		}
		if err := biz.repo.CreateOrderHistory(ctx, tx, history); err != nil {
			return core.ErrInternal(err)
		}

		return nil
	})
}
