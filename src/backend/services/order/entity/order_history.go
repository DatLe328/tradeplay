package entity

import (
	"tradeplay/common"
)

type OrderHistory struct {
	common.SQLModel
	OrderId int32 `json:"order_id" gorm:"column:order_id;index"`

	OldStatus *OrderStatus `json:"old_status" gorm:"column:old_status"`
	NewStatus OrderStatus  `json:"new_status" gorm:"column:new_status"`

	Note      string `json:"note" gorm:"column:note"`
	ChangedBy int32  `json:"changed_by" gorm:"column:changed_by"`
	IpAddress string `json:"ip_address" gorm:"column:ip_address"`

	Metadata *common.JSON `json:"metadata" gorm:"column:metadata;type:json"`
}

func (OrderHistory) TableName() string { return "order_history" }
