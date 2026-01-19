package entity

import (
	"time"

	"github.com/DatLe328/service-context/core"
)

type OrderHistory struct {
	Id      int64 `json:"id" gorm:"column:id;primaryKey;autoIncrement"`
	OrderId int   `json:"order_id" gorm:"column:order_id;index"`

	OldStatus *OrderStatus `json:"old_status" gorm:"column:old_status"`
	NewStatus OrderStatus  `json:"new_status" gorm:"column:new_status"`

	Note      string `json:"note" gorm:"column:note"`
	ChangedBy int    `json:"changed_by" gorm:"column:changed_by"`
	IpAddress string `json:"ip_address" gorm:"column:ip_address"`

	Metadata *core.JSON `json:"metadata" gorm:"column:metadata;type:json"`

	CreatedAt *time.Time `json:"created_at" gorm:"column:created_at"`
}

func (OrderHistory) TableName() string { return "order_history" }
