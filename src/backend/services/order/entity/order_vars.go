package entity

type OrderCreate struct {
	AccountId  *string   `json:"account_id" form:"account_id"`
	TotalPrice int64     `json:"total_price" form:"total_price"`
	Type       OrderType `json:"type" form:"type"`
}

func (OrderCreate) TableName() string { return Order{}.TableName() }

type OrderUpdate struct {
	Status OrderStatus `json:"status"`
}

func (OrderUpdate) TableName() string { return Order{}.TableName() }

type OrderFilter struct {
	Type *OrderType `json:"type,omitempty" form:"type"`
}
