package entity

import (
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
)

type WalletTxType int

const (
	TxTypeDeposit WalletTxType = iota
	TxTypeWithdraw
	TxTypePurchase
	TxTypeRefund
	TxTypeCommission
	TxTypeBonus
)

type WalletTransaction struct {
	core.SQLModel
	WalletId      int     `json:"wallet_id" gorm:"column:wallet_id;index"`
	Amount        float64 `json:"amount" gorm:"column:amount"`
	BeforeBalance float64 `json:"before_balance" gorm:"column:before_balance"`
	AfterBalance  float64 `json:"after_balance" gorm:"column:after_balance"`

	Type WalletTxType `json:"type" gorm:"column:type;index"`

	RefType string `json:"ref_type" gorm:"column:ref_type"`
	RefId   string `json:"ref_id" gorm:"column:ref_id;index"`

	Description string     `json:"description" gorm:"column:description"`
	Metadata    *core.JSON `json:"metadata" gorm:"column:metadata;type:json"`
}

func (WalletTransaction) TableName() string { return "wallet_transactions" }

func (wt *WalletTransaction) Mask() {
	wt.SQLModel.Mask(common.MaskTypeWalletTx)
}
