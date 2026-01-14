package entity

type OrderCreate struct {
	AccountId string `json:"account_id" form:"account_id"`
}

func (OrderCreate) TableName() string { return Order{}.TableName() }

type OrderUpdate struct {
	Status OrderStatus `json:"status"`
}

func (OrderUpdate) TableName() string { return Order{}.TableName() }
