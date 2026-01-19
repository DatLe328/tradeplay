package business

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"
	accountEntity "tradeplay/services/account/entity"
	"tradeplay/services/order/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (biz *business) CreateOrder(ctx context.Context, userId int, data *entity.OrderCreate, ipAddress string) (*entity.Order, error) {
	if data.Type == entity.OrderTypeDeposit {
		if data.TotalPrice < 10000 {
			return nil, core.ErrInvalidRequest(errors.New("số tiền nạp tối thiểu là 10,000 VND"))
		}

		newOrder := &entity.Order{
			SQLModel:   core.NewSQLModel(),
			UserId:     userId,
			AccountId:  nil,
			TotalPrice: data.TotalPrice,
			Status:     entity.OrderStatusPending,
			Type:       entity.OrderTypeDeposit,
			Notes:      "Nạp tiền vào ví",
		}

		if err := biz.repo.CreateOrder(ctx, newOrder); err != nil {
			return nil, core.ErrInternal(err)
		}
		_ = biz.repo.CreateOrderHistory(ctx, &entity.OrderHistory{
			OrderId:   newOrder.Id,
			NewStatus: entity.OrderStatusPending,
			Note:      "Tạo đơn nạp tiền",
			ChangedBy: userId,
			IpAddress: ipAddress,
		})

		newOrder.Mask()
		return newOrder, nil
	}

	if data.AccountId == nil || *data.AccountId == "" {
		return nil, core.ErrInvalidRequest(errors.New("account_id is required for buying"))
	}

	accId, err := strconv.Atoi(*data.AccountId)
	if err != nil {
		return nil, core.ErrInvalidRequest(errors.New("invalid account id"))
	}

	var newOrder *entity.Order

	db := biz.walletRepo.GetDB()

	err = db.Transaction(func(tx *gorm.DB) error {
		// 1. Kiểm tra Account (Có thể lock row nếu cần thiết, ở đây check status)
		// Lưu ý: Tốt nhất nên dùng query trực tiếp với tx để đảm bảo consistency
		var account accountEntity.Account
		if err := tx.First(&account, accId).Error; err != nil {
			return core.ErrInvalidRequest(errors.New("account not found"))
		}

		if account.Status != accountEntity.AccountStatusAvailable {
			return core.ErrInvalidRequest(errors.New("tài khoản này đã bán hoặc không khả dụng"))
		}

		// 2. Kiểm tra và Khóa Ví (Pessimistic Locking)
		// GetWalletForUpdate đã được bạn define trong interface
		wallet, err := biz.walletRepo.GetWalletForUpdate(ctx, tx, userId, "VND")
		if err != nil {
			return core.ErrInternal(errors.New("không thể truy xuất ví người dùng"))
		}

		if wallet.Balance < account.Price {
			return core.ErrInvalidRequest(errors.New("số dư không đủ để thanh toán"))
		}

		// 3. Trừ tiền
		oldBalance := wallet.Balance
		newBalance := oldBalance - account.Price

		// Update Balance
		if err := tx.Model(wallet).Update("balance", newBalance).Error; err != nil {
			return err
		}

		// 4. Tạo Order (Trạng thái Completed/Paid luôn)
		newOrder = &entity.Order{
			SQLModel:      core.NewSQLModel(),
			UserId:        userId,
			AccountId:     &accId,
			TotalPrice:    account.Price,
			Status:        entity.OrderStatusCompleted, // Đã xong luôn
			Type:          entity.OrderTypeBuyAcc,
			PaymentMethod: "WALLET",
			PaymentRef:    fmt.Sprintf("W_%d_%d", userId, time.Now().Unix()),
			Notes:         "Mua bằng số dư ví",
		}

		if err := tx.Create(newOrder).Error; err != nil {
			return err
		}

		// 5. Cập nhật trạng thái Account -> Sold
		if err := tx.Model(&account).Update("status", accountEntity.AccountStatusSold).Error; err != nil {
			return err
		}

		// 6. Lưu lịch sử biến động số dư (Wallet Transaction)
		walletTx := &walletEntity.WalletTransaction{
			SQLModel:      core.NewSQLModel(),
			WalletId:      wallet.UserId,  // Lưu ý: check lại field này map với User hay Wallet ID table
			Amount:        -account.Price, // Số âm
			BeforeBalance: oldBalance,
			AfterBalance:  newBalance,
			Type:          walletEntity.TxTypePurchase, //
			RefType:       "order",
			RefId:         strconv.Itoa(newOrder.Id),
			Description:   fmt.Sprintf("Thanh toán mua acc: %s", account.Title),
		}

		if err := biz.walletRepo.CreateWalletTransaction(ctx, tx, walletTx); err != nil {
			return err
		}

		// 7. Lưu Order History (Audit log)
		history := &entity.OrderHistory{
			OrderId:   newOrder.Id,
			NewStatus: entity.OrderStatusCompleted,
			Note:      "Mua thành công qua Ví",
			ChangedBy: userId,
			IpAddress: ipAddress,
		}
		if err := tx.Create(history).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	newOrder.Mask()
	return newOrder, nil
}
