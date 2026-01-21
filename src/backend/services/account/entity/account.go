package entity

import (
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
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
	core.SQLModel
	OwnerId int              `json:"-" gorm:"column:owner_id;"`
	User    *core.SimpleUser `json:"user" gorm:"preload:false;foreignKey:OwnerId"`
	FakeId  int              `json:"id" gorm:"-"`

	GameName      string   `json:"game_name" gorm:"column:game_name"`
	Title         string   `json:"title" gorm:"column:title"`
	Description   string   `json:"description" gorm:"column:description;type:text"`
	Price         float64  `json:"price" gorm:"column:price"`
	OriginalPrice *float64 `json:"original_price" gorm:"column:original_price"`
	Thumbnail     string   `json:"thumbnail" gorm:"column:thumbnail"`

	Images []string `json:"images" gorm:"column:images;serializer:json"`

	Attributes map[string]interface{} `json:"attributes" gorm:"column:attributes;type:json;serializer:json"`
	Features   []string               `json:"features" gorm:"column:features;type:json;serializer:json"`

	Status    AccountStatus `json:"status" gorm:"column:status;default:0;index"`
	ViewCount int           `json:"view_count" gorm:"column:view_count;default:0"`
	Info      *AccountInfo  `json:"info,omitempty" gorm:"foreignKey:AccountId"`
}

func (Account) TableName() string { return "accounts" }

func (a *Account) Mask() {
	// a.FakeId = common.MaskID(a.Id, common.AccountIdOffset)
	a.FakeId = a.Id

	if a.User != nil {
		a.User.Mask(common.MaskTypeUser)
	}
}
