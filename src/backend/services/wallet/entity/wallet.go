package entity

import (
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
)

type WalletStatus int

const (
	WalletStatusInactive WalletStatus = iota
	WalletStatusActive
	WalletStatusFrozen
	WalletStatusClosed
)

type Wallet struct {
	core.SQLModel
	UserId   int          `json:"user_id" gorm:"column:user_id;index"`
	Balance  float64      `json:"balance" gorm:"column:balance;default:0"`
	Currency string       `json:"currency" gorm:"column:currency;default:'VND'"`
	Status   WalletStatus `json:"status" gorm:"column:status;default:1"`
}

func (Wallet) TableName() string { return "wallets" }

func (w *Wallet) Mask() {
	w.SQLModel.Mask(common.MaskTypeWallet)
}
