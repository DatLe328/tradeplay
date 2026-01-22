package entity

import (
	"tradeplay/common"
	accountEntity "tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

type OrderStatus int

const (
	OrderStatusPending OrderStatus = iota
	OrderStatusPaid
	OrderStatusCompleted
	OrderStatusCancelled
	OrderStatusRefunded
)

type OrderType int

const (
	OrderTypeBuyAcc OrderType = iota
	OrderTypeDeposit
)

type Order struct {
	core.SQLModel
	UserId     int       `json:"-" gorm:"column:user_id;index"`
	FakeUserId *core.UID `json:"user_id" gorm:"-"`
	AccountId  *int      `json:"account_id" gorm:"column:account_id;index"`

	Account *accountEntity.Account `json:"account" gorm:"foreignKey:AccountId;preload:false"`

	TotalPrice float64 `json:"total_price" gorm:"column:total_price"`

	Status OrderStatus `json:"status" gorm:"column:status"`
	Type   OrderType   `json:"type" gorm:"column:type;"`

	PaymentMethod  string `json:"payment_method" gorm:"column:payment_method;"`
	PaymentRef     string `json:"payment_ref" gorm:"column:payment_ref;"`
	PaymentTransId string `json:"payment_trans_id" gorm:"column:payment_trans_id"`
	Notes          string `json:"notes" gorm:"column:notes;"`
}

func (Order) TableName() string { return "orders" }

func (o *Order) Mask() {
	o.SQLModel.Mask(common.MaskTypeOrder)
	uid := core.NewUID(uint32(o.UserId), int(common.MaskTypeUser), 1)
	o.FakeUserId = &uid

	if o.Account != nil {
		o.Account.Mask()
	}
}

func (o *Order) MaskDisplay() {
	o.SQLModel.Mask(common.MaskTypeOrderDisplay)
	uid := core.NewUID(uint32(o.UserId), int(common.MaskTypeUserDisplay), 1)
	o.FakeUserId = &uid

	if o.Account != nil {
		o.Account.Mask()
	}
}
