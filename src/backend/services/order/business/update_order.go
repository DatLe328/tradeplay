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
	order, err := biz.repo.GetOrder(ctx, orderId)
	if err != nil {
		return core.ErrCannotGetEntity(orderEntity.Order{}.TableName(), err)
	}

	oldStatus := order.Status
	if oldStatus == newStatus {
		return nil
	}

	// LOGIC XỬ LÝ KHI ĐƠN HÀNG HOÀN THÀNH (PAID/COMPLETED)
	if newStatus == orderEntity.OrderStatusCompleted || newStatus == orderEntity.OrderStatusPaid {

		// TRƯỜNG HỢP 1: NẠP TIỀN -> CỘNG VÍ
		if order.Type == orderEntity.OrderTypeDeposit {
			// Dùng Transaction của WalletRepo để đảm bảo an toàn
			err := biz.walletRepo.GetDB().Transaction(func(tx *gorm.DB) error {
				// 1. Lock ví user để tránh race condition
				wallet, err := biz.walletRepo.GetWalletForUpdate(ctx, tx, order.UserId, "VND")
				if err != nil {
					return fmt.Errorf("wallet not found: %v", err)
				}

				// 2. Cộng tiền
				newBalance := wallet.Balance + order.TotalPrice
				if err := tx.Model(wallet).Update("balance", newBalance).Error; err != nil {
					return err
				}

				// 3. Ghi log transaction ví
				walletTx := &walletEntity.WalletTransaction{
					SQLModel:      core.NewSQLModel(),
					WalletId:      wallet.Id,
					Amount:        order.TotalPrice,
					BeforeBalance: wallet.Balance,
					AfterBalance:  newBalance,
					Type:          walletEntity.TxTypeDeposit, // Enum 1
					RefType:       "order",
					RefId:         fmt.Sprintf("%d", order.Id),
					Description:   fmt.Sprintf("Nạp tiền qua đơn hàng #%d", order.Id),
				}

				return biz.walletRepo.CreateWalletTransaction(ctx, tx, walletTx)
			})

			if err != nil {
				return core.ErrInternal(fmt.Errorf("failed to process deposit: %v", err))
			}
		}

		// TRƯỜNG HỢP 2: MUA ACC -> UPDATE TRẠNG THÁI ACC
		if order.Type == orderEntity.OrderTypeBuyAcc && order.AccountId != nil {
			statusSold := accountEntity.AccountStatusSold
			data := accountEntity.AccountDataUpdate{
				Status: &statusSold,
			}
			// Lưu ý: Có thể check thêm nếu update thất bại thì rollback
			if err := biz.accountRepo.UpdateAccount(ctx, *order.AccountId, &data); err != nil {
				return core.ErrInternal(err)
			}
		}
	}

	// Cập nhật trạng thái đơn hàng
	if err := biz.repo.UpdateOrderStatus(ctx, orderId, newStatus); err != nil {
		return core.ErrInternal(err)
	}

	// Ghi log history
	history := &orderEntity.OrderHistory{
		OrderId:   orderId,
		OldStatus: &oldStatus,
		NewStatus: newStatus,
		Note:      fmt.Sprintf("Status changed from %v to %v", oldStatus, newStatus),
		ChangedBy: requesterId,
		IpAddress: ipAddress,
	}
	_ = biz.repo.CreateOrderHistory(ctx, history)

	return nil
}
