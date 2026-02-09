package business

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	notificationHelper "tradeplay/services/notification"
	notificationEntity "tradeplay/services/notification/entity"
	orderEntity "tradeplay/services/order/entity"
	paymentEntity "tradeplay/services/payment/entity"

	"gorm.io/gorm"
)

func (biz *business) VerifyWebhookSignature(payload []byte, signature string) bool {
	h := hmac.New(sha256.New, []byte(biz.sepayApiKey))
	h.Write(payload)
	expectedSignature := hex.EncodeToString(h.Sum(nil))
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

func (biz *business) ProcessSepayWebhook(
	ctx context.Context,
	payload *paymentEntity.SepayWebhookPayload,
	orderCode string,
	signature string,
	payloadBytes []byte,
) error {
	if signature != "" {
		if !biz.VerifyWebhookSignature(payloadBytes, signature) {
			biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
				UserId:   0,
				Action:   "WEBHOOK_SIGNATURE_INVALID",
				ErrorMsg: fmt.Sprintf("Invalid signature for reference code: %s", payload.ReferenceCode),
			})
			return common.ErrBadRequest(errors.New("invalid webhook signature"), "Webhook signature verification failed")
		}
	} else {
		biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:   0,
			Action:   "WEBHOOK_NO_SIGNATURE",
			ErrorMsg: fmt.Sprintf("Warning: No webhook signature provided for reference code: %s. Proceeding without verification.", payload.ReferenceCode),
		})
	}

	if payload.TransferType != "in" {
		return nil
	}
	sepayIDStr := strconv.Itoa(payload.ID)
	if sepayIDStr == "0" || sepayIDStr == "" {
		return errors.New("invalid sepay webhook id")
	}

	uid, err := common.FromBase58(orderCode)
	if err != nil {
		return common.ErrBadRequest(err, "Invalid order code")
	}
	orderID := int32(uid.GetLocalID())

	// Set transaction timeout to 30 seconds for webhook processing
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	return biz.db.WithContext(ctxWithTimeout).Transaction(func(tx *gorm.DB) error {
		// Idempotency check: Check if webhook already processed
		existingWebhook, err := biz.repo.GetPaymentWebhookBySepayID(ctxWithTimeout, tx, sepayIDStr)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		
		// If webhook already processed, return success to prevent duplicate processing
		if err == nil && existingWebhook != nil {
			if existingWebhook.Status == "processed" {
				biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
					UserId:   0,
					Action:   "WEBHOOK_DUPLICATE",
					ErrorMsg: fmt.Sprintf("Duplicate webhook received for reference code: %s, skipping", payload.ReferenceCode),
				})
				return nil
			}
			// If webhook is currently being processed, return error to retry later
			if existingWebhook.Status == "processing" {
				return errors.New("webhook is already being processed")
			}
		}

		webhookRecord := &paymentEntity.PaymentWebhook{
			SQLModel:      common.NewSQLModel(),
			OrderID:       orderID,
			WebhookID:     sepayIDStr,
			ReferenceCode: payload.ReferenceCode,
			Gateway:       payload.Gateway,
			Status:        "processing",
		}

		if err := biz.repo.CreatePaymentWebhook(ctxWithTimeout, tx, webhookRecord); err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				// Another request is processing this webhook, return success for idempotency
				biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
					UserId:   0,
					Action:   "WEBHOOK_RACE_CONDITION",
					ErrorMsg: fmt.Sprintf("Race condition detected for webhook %s, another request is handling it", sepayIDStr),
				})
				return nil
			}
			return err
		}

		order, err := biz.orderBusiness.GetOrderInternal(ctxWithTimeout, orderID)
		if err != nil {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			return err
		}
		if order == nil {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			return errors.New("order not found in system")
		}
		if order.Type != orderEntity.OrderTypeDeposit {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			return errors.New("order is not a deposit order")
		}
		if order.Status != orderEntity.OrderStatusPending {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			return errors.New("order is not in pending status")
		}

		if order.TotalPrice != payload.TransferAmount {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
				UserId:   order.UserID,
				Action:   "WEBHOOK_AMOUNT_MISMATCH",
				ErrorMsg: fmt.Sprintf("Amount mismatch for order %d: expected %d but got %d", orderID, order.TotalPrice, payload.TransferAmount),
			})
			return fmt.Errorf("amount mismatch: expected %d but got %d", order.TotalPrice, payload.TransferAmount)
		}

		order, err = biz.orderBusiness.MarkOrderAsPaid(ctxWithTimeout, tx, orderID, payload.TransferAmount, payload.Gateway, payload.ReferenceCode)
		if err != nil {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			
			// Create failure notification
			_, _ = notificationHelper.CreateNotification(
				ctxWithTimeout,
				biz.notificationRepository,
				order.UserID,
				notificationEntity.NotificationTypeOrderStatus,
				"Nạp tiền thất bại",
				fmt.Sprintf("Nạp tiền thất bại: %s", err.Error()),
				nil,
				nil,
			)
			
			biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
				UserId:   0,
				Action:   "PAYMENT_FAILED",
				ErrorMsg: err.Error(),
			})
			return err
		}

		if order == nil {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			return nil
		}

		txData := map[string]interface{}{
			"sepay_payload": payload,
		}
		txBytes, _ := json.Marshal(txData)
		metadata := common.JSON(txBytes)

		description := fmt.Sprintf("Nạp tiền tự động SePay: %s", payload.ReferenceCode)

		orderID := strconv.Itoa(int(order.ID))
		if err := biz.walletBusiness.Deposit(
			ctxWithTimeout, tx, order.UserID, payload.TransferAmount, orderID, description, &metadata); err != nil {
			biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "failed")
			return err
		}

		if err := biz.repo.UpdatePaymentWebhookStatus(ctxWithTimeout, tx, payload.ReferenceCode, "processed"); err != nil {
			return err
		}

		now := time.Now()
		if err := tx.WithContext(ctxWithTimeout).Model(&paymentEntity.PaymentWebhook{}).
			Where("reference_code = ?", payload.ReferenceCode).
			Update("processed_at", now).Error; err != nil {
			return err
		}

		if err := biz.orderBusiness.MarkOrderAsCompleted(ctxWithTimeout, tx, order.ID, "SePay payment processed"); err != nil {
			return err
		}

		// Create notification for successful payment
		notificationMsg := fmt.Sprintf("Nạp tiền thành công: +%d đ từ SePay", payload.TransferAmount)
		_, _ = notificationHelper.CreateNotification(
			ctxWithTimeout,
			biz.notificationRepository,
			order.UserID,
			notificationEntity.NotificationTypeOrderStatus,
			"Nạp tiền thành công",
			notificationMsg,
			nil,
			nil,
		)

		biz.auditRepo.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:     order.UserID,
			Action:     "DEPOSIT_SUCCESS_SEPAY",
			StatusCode: 200,
		})

		return nil
	})
}
