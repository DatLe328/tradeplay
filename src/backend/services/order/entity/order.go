package entity

import (
	"tradeplay/common"
	accountEntity "tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusPaid      OrderStatus = "paid"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"
	OrderStatusRefunded  OrderStatus = "refunded"
)

type Order struct {
	core.SQLModel
	UserId    int `json:"user_id" gorm:"column:user_id;index"`
	AccountId int `json:"account_id" gorm:"column:account_id;index"`

	Account *accountEntity.Account `json:"account" gorm:"foreignKey:AccountId;preload:false"`

	TotalPrice float64 `json:"total_price" gorm:"column:total_price"`

	Status OrderStatus `json:"status" gorm:"column:status"`
}

func (Order) TableName() string { return "orders" }

func (o *Order) Mask() {
	o.SQLModel.Mask(common.MaskTypeOrder)

	if o.Account != nil {
		o.Account.Mask()
	}
}
