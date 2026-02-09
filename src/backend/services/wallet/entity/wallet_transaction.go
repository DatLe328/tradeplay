package entity

import (
	"tradeplay/common"
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
	common.SQLModel
	WalletId      int32 `json:"wallet_id" gorm:"column:wallet_id;index"`
	Amount        int64 `json:"amount" gorm:"column:amount"`
	BeforeBalance int64 `json:"before_balance" gorm:"column:before_balance"`
	AfterBalance  int64 `json:"after_balance" gorm:"column:after_balance"`

	Type WalletTxType `json:"type" gorm:"column:type;index"`

	RefType string `json:"ref_type" gorm:"column:ref_type"`
	RefId   string `json:"ref_id" gorm:"column:ref_id;index"`

	Description string       `json:"description" gorm:"column:description"`
	Metadata    *common.JSON `json:"metadata" gorm:"column:metadata;type:json"`
}

func (WalletTransaction) TableName() string { return "wallet_transactions" }

func (wt *WalletTransaction) Mask() {
	wt.SQLModel.Mask(common.MaskTypeWalletTx)
}

func NewWalletTransaction(
	walletId int32,
	amount int64,
	beforeBalance int64,
	afterBalance int64,
	txType WalletTxType,
	refType string,
	refId string,
	description string,
	metaData *common.JSON,
) *WalletTransaction {
	return &WalletTransaction{
		SQLModel:      common.NewSQLModel(),
		WalletId:      walletId,
		Amount:        amount,
		BeforeBalance: beforeBalance,
		AfterBalance:  afterBalance,
		Type:          txType,
		RefType:       refType,
		RefId:         refId,
		Description:   description,
		Metadata:      metaData,
	}
}
