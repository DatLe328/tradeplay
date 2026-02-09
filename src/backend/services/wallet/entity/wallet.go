package entity

import (
	"tradeplay/common"
)

type WalletStatus int

const (
	WalletStatusInactive WalletStatus = iota
	WalletStatusActive
	WalletStatusFrozen
	WalletStatusClosed
)

type Wallet struct {
	common.SQLModel
	UserID  int32        `json:"user_id" gorm:"column:user_id;index"`
	Balance int64        `json:"balance" gorm:"column:balance;"`
	Status  WalletStatus `json:"status" gorm:"column:status;"`
}

func (Wallet) TableName() string { return "wallets" }

func (w *Wallet) Mask() {
	w.SQLModel.Mask(common.MaskTypeWallet)
}

type WalletOption func(*Wallet)

func WithUserID(userID int32) WalletOption {
	return func(w *Wallet) {
		w.UserID = userID
	}
}

func NewWallet(userID int32, opts ...WalletOption) *Wallet {
	wallet := &Wallet{
		UserID:  userID,
		Balance: 0,
		Status:  WalletStatusActive,
	}
	for _, opt := range opts {
		opt(wallet)
	}
	return wallet
}
