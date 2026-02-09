package business

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"
	"tradeplay/common"
	accountEntity "tradeplay/services/account/entity"
	auditEntity "tradeplay/services/audit/entity"
	orderEntity "tradeplay/services/order/entity"

	"gorm.io/gorm"
)

func (biz *business) CreateOrder(ctx context.Context, userID int32, data *orderEntity.OrderCreate, ipAddress string) (*orderEntity.Order, error) {
	if data.Type == orderEntity.OrderTypeDeposit {
		return biz.handleDepositOrder(ctx, userID, data, ipAddress)
	}

	if data.AccountId == nil || *data.AccountId == "" {
		return nil, common.ErrInvalidRequest(errors.New("account_id is required for buying"))
	}

	tmp, err := strconv.Atoi(*data.AccountId)
	accID := int32(tmp)
	if err != nil {
		return nil, common.ErrInvalidRequest(errors.New("invalid account id format"))
	}

	var newOrder *orderEntity.Order
	db := biz.orderRepository.GetDB()

	// Set transaction timeout to 30 seconds for order creation
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	err = db.WithContext(ctxWithTimeout).Transaction(func(tx *gorm.DB) error {
		account, err := biz.accountBusiness.GetAndLockAccount(ctxWithTimeout, tx, accID)
		if err != nil {
			return err
		}

		if account.Status != accountEntity.AccountStatusAvailable {
			return common.ErrInvalidRequest(errors.New("tài khoản không còn khả dụng"))
		}

		desc := fmt.Sprintf("Thanh toán mua acc: %s", account.Title)
		err = biz.walletBusiness.Debit(ctxWithTimeout, tx, userID, account.Price, "PENDING_ORDER", desc)
		if err != nil {
			return err
		}

		newOrder = &orderEntity.Order{
			SQLModel:      common.NewSQLModel(),
			UserID:        userID,
			AccountID:     &accID,
			TotalPrice:    account.Price,
			Status:        orderEntity.OrderStatusCompleted,
			Type:          orderEntity.OrderTypeBuyAcc,
			PaymentMethod: "WALLET",
			PaymentRef:    fmt.Sprintf("W_%d_%d", userID, time.Now().UnixNano()),
			Notes:         "Mua bằng số dư ví",
		}

		if err := tx.Create(newOrder).Error; err != nil {
			return common.ErrDB(err)
		}

		if err := biz.accountBusiness.MarkAsSold(ctxWithTimeout, tx, accID, userID); err != nil {
			return err
		}

		history := &orderEntity.OrderHistory{
			OrderId:   newOrder.ID,
			NewStatus: orderEntity.OrderStatusCompleted,
			Note:      "Mua thành công qua Ví",
			ChangedBy: userID,
			IpAddress: ipAddress,
		}
		return tx.Create(history).Error
	})

	if err != nil {
		return nil, err
	}

	go biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
		UserId: userID, Action: "BUY_ACC_SUCCESS", StatusCode: 201, IpAddress: ipAddress,
	})

	newOrder.Mask()
	return newOrder, nil
}

func (biz *business) handleDepositOrder(
	ctx context.Context,
	userID int32,
	data *orderEntity.OrderCreate,
	ipAddress string,
) (*orderEntity.Order, error) {
	if data.TotalPrice < 10000 {
		return nil, common.ErrInvalidRequest(errors.New("số tiền nạp tối thiểu là 10,000 VND"))
	}

	var existingOrder orderEntity.Order
	err := biz.orderRepository.GetDB().Where("user_id = ? AND status = ? AND type = ?",
		userID, orderEntity.OrderStatusPending, orderEntity.OrderTypeDeposit).First(&existingOrder).Error

	if err == nil {
		if existingOrder.TotalPrice == data.TotalPrice {
			existingOrder.Mask()
			return &existingOrder, nil
		}
		biz.orderRepository.GetDB().Model(&existingOrder).Update("status", orderEntity.OrderStatusCancelled)
	}

	newOrder := &orderEntity.Order{
		SQLModel:   common.NewSQLModel(),
		UserID:     userID,
		TotalPrice: data.TotalPrice,
		Status:     orderEntity.OrderStatusPending,
		Type:       orderEntity.OrderTypeDeposit,
		Notes:      "Tạo lệnh nạp tiền",
	}

	if err := biz.orderRepository.CreateOrder(ctx, newOrder); err != nil {
		return nil, common.ErrInternal(err)
	}

	_ = biz.orderRepository.CreateOrderHistory(ctx, nil, &orderEntity.OrderHistory{
		OrderId: newOrder.ID, NewStatus: orderEntity.OrderStatusPending, Note: "Khởi tạo đơn nạp", ChangedBy: userID, IpAddress: ipAddress,
	})

	newOrder.Mask()
	return newOrder, nil
}
