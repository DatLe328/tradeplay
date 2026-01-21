package business

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	accountEntity "tradeplay/services/account/entity"
	orderEntity "tradeplay/services/order/entity"
	paymentEntity "tradeplay/services/payment/entity"
	walletEntity "tradeplay/services/wallet/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (biz *business) ProcessSepayWebhook(ctx context.Context, payload *paymentEntity.SepayWebhookPayload) error {
	if payload.TransferType != "in" {
		return nil
	}

	uid, err := core.FromBase58(payload.Content)
	if err != nil {
		return core.ErrInternal(err)
	}
	orderId := int(uid.GetLocalID())

	db := biz.walletRepo.GetDB()

	return db.Transaction(func(tx *gorm.DB) error {
		order, err := biz.orderRepo.GetOrderForUpdate(ctx, tx, orderId)
		if err != nil {
			return err
		}

		if order.Status == orderEntity.OrderStatusPaid || order.Status == orderEntity.OrderStatusCompleted {
			return nil
		}

		if payload.TransferAmount < order.TotalPrice {
			return fmt.Errorf("số tiền chuyển (%v) nhỏ hơn giá trị đơn hàng (%v)", payload.TransferAmount, order.TotalPrice)
		}

		if err := biz.orderRepo.UpdateOrderStatus(ctx, tx, order.Id, orderEntity.OrderStatusPaid); err != nil {
			return err
		}

		historyData := map[string]interface{}{
			"gateway":        payload.Gateway,
			"reference_code": payload.ReferenceCode,
			"sepay_id":       payload.ID,
			"content":        payload.Content,
		}
		historyBytes, _ := json.Marshal(historyData)
		historyJSON := core.JSON(historyBytes)

		history := &orderEntity.OrderHistory{
			OrderId:   order.Id,
			OldStatus: &order.Status,
			NewStatus: orderEntity.OrderStatusPaid,
			Note:      fmt.Sprintf("Thanh toán thành công qua SePay. Ref: %s", payload.ReferenceCode),
			Metadata:  &historyJSON,
		}
		if err := biz.orderRepo.CreateOrderHistory(ctx, tx, history); err != nil {
			return err
		}

		switch order.Type {
		case orderEntity.OrderTypeDeposit:
			return biz.handleDepositTransaction(ctx, tx, order, payload)

		case orderEntity.OrderTypeBuyAcc:
			return biz.handleBuyAccountTransaction(ctx, tx, order, payload)
		}

		return nil
	})
}

func (biz *business) handleDepositTransaction(
	ctx context.Context,
	tx *gorm.DB,
	order *orderEntity.Order,
	payload *paymentEntity.SepayWebhookPayload,
) error {
	wallet, err := biz.walletRepo.GetWalletForUpdate(ctx, tx, order.UserId, "VND")
	if err != nil {
		return err
	}

	oldBalance := wallet.Balance
	newBalance := oldBalance + payload.TransferAmount

	wallet.Balance = newBalance
	if err := tx.Save(wallet).Error; err != nil {
		return err
	}
	txData := map[string]interface{}{
		"sepay_payload": payload,
	}
	txBytes, err := json.Marshal(txData)
	if err != nil {
		return err
	}

	txJSON := core.JSON(txBytes)

	walletTx := &walletEntity.WalletTransaction{
		WalletId:      wallet.UserId,
		Amount:        payload.TransferAmount,
		BeforeBalance: oldBalance,
		AfterBalance:  newBalance,
		Type:          walletEntity.TxTypeDeposit,
		RefType:       "order",
		RefId:         strconv.Itoa(order.Id),
		Description:   fmt.Sprintf("Nạp tiền tự động qua SePay: %s", payload.ReferenceCode),
		Metadata:      &txJSON,
	}

	if err := biz.walletRepo.CreateWalletTransaction(ctx, tx, walletTx); err != nil {
		return err
	}

	if err := biz.orderRepo.UpdateOrderPaid(ctx, tx, order.Id, payload.Gateway, payload.ReferenceCode); err != nil {
		return err
	}

	return nil
}

func (biz *business) handleBuyAccountTransaction(
	ctx context.Context,
	tx *gorm.DB,
	order *orderEntity.Order,
	payload *paymentEntity.SepayWebhookPayload,
) error {
	if order.AccountId == nil {
		return errors.New("đơn hàng mua account nhưng không có AccountId")
	}

	account, err := biz.accountRepo.GetAccountByID(ctx, *order.AccountId)
	if err != nil {
		return err
	}

	if account.Status != accountEntity.AccountStatusAvailable {
		wallet, err := biz.walletRepo.GetWalletForUpdate(ctx, tx, order.UserId, "VND")
		if err != nil {
			return err
		}

		newBalance := wallet.Balance + payload.TransferAmount
		wallet.Balance = newBalance
		if err := tx.Save(wallet).Error; err != nil {
			return err
		}

		walletTx := &walletEntity.WalletTransaction{
			WalletId:      wallet.UserId,
			Amount:        payload.TransferAmount,
			BeforeBalance: wallet.Balance - payload.TransferAmount,
			AfterBalance:  newBalance,
			Type:          walletEntity.TxTypeRefund,
			RefType:       "order",
			RefId:         strconv.Itoa(order.Id),
			Description:   fmt.Sprintf("Hoàn tiền đơn hàng %d do Account đã bán. Ref: %s", order.Id, payload.ReferenceCode),
		}
		if err := biz.walletRepo.CreateWalletTransaction(ctx, tx, walletTx); err != nil {
			return err
		}

		if err := biz.orderRepo.UpdateOrderStatus(ctx, tx, order.Id, orderEntity.OrderStatusRefunded); err != nil {
			return err
		}

		return nil
	}

	if err := biz.orderRepo.UpdateOrderPaid(ctx, tx, order.Id, payload.Gateway, payload.ReferenceCode); err != nil {
		return err
	}

	status := accountEntity.AccountStatusSold
	accountUpdate := &accountEntity.AccountDataUpdate{
		Status: &status,
	}

	if err := biz.accountRepo.UpdateAccount(ctx, tx, *order.AccountId, accountUpdate); err != nil {
		return err
	}

	return nil
}
