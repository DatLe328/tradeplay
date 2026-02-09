package entity

import (
	"tradeplay/common"
)

type AccountStatus int

const (
	AccountStatusDraft AccountStatus = iota
	AccountStatusAvailable
	AccountStatusReserved
	AccountStatusSold
	AccountStatusDeleted
)

type Account struct {
	common.SQLModel
	OwnerId int32              `json:"-" gorm:"column:owner_id;"`
	User    *common.SimpleUser `json:"user" gorm:"preload:false;foreignKey:OwnerId"`

	CategoryId int32     `json:"category_id" gorm:"column:category_id;"`
	Category   *Category `json:"category" gorm:"foreignKey:CategoryId"`

	FakeId        int32  `json:"id" gorm:"-"`
	Title         string `json:"title" gorm:"column:title"`
	Description   string `json:"description" gorm:"column:description;type:text"`
	Price         int64  `json:"price" gorm:"column:price"`
	OriginalPrice *int64 `json:"original_price" gorm:"column:original_price"`
	Thumbnail     string `json:"thumbnail" gorm:"column:thumbnail"`

	Images []string `json:"images" gorm:"column:images;serializer:json"`

	Attributes map[string]interface{} `json:"attributes" gorm:"column:attributes;type:json;serializer:json"`
	Features   []string               `json:"features" gorm:"column:features;type:json;serializer:json"`

	Status    AccountStatus `json:"status" gorm:"column:status;default:0;index"`
	ViewCount int           `json:"view_count" gorm:"column:view_count;default:0"`

	Version int `json:"version" gorm:"column:version;default:0"`

	Info *AccountInfo `json:"info,omitempty" gorm:"foreignKey:AccountId"`
}

func (Account) TableName() string { return "accounts" }

func (a *Account) Mask() {
	a.FakeId = a.ID
	if a.User != nil {
		a.User.Mask(common.MaskTypeUser)
	}
}
