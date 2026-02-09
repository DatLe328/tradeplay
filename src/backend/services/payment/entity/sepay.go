package entity

import (
	"time"
	"tradeplay/common"
)

type SepayWebhookPayload struct {
	ID              int    `json:"id"`
	Gateway         string `json:"gateway"`
	TransactionDate string `json:"transactionDate"`
	AccountNumber   string `json:"accountNumber"`
	Code            string `json:"code"`
	Content         string `json:"content"`
	TransferType    string `json:"transferType"`
	TransferAmount  int64  `json:"transferAmount"`
	Accumulated     int64  `json:"accumulated"`
	ReferenceCode   string `json:"referenceCode"`
	Description     string `json:"description"`
}

type PaymentWebhook struct {
	common.SQLModel
	OrderID       int32  `gorm:"uniqueIndex"`
	WebhookID     string `gorm:"uniqueIndex"`
	ReferenceCode string `gorm:"uniqueIndex"`
	Gateway       string
	Status        string
	ProcessedAt   *time.Time `gorm:"column:processed_at"`
}

func (PaymentWebhook) TableName() string {
	return "payment_webhooks"
}
