package entity

import "tradeplay/common"

type Category struct {
	common.SQLModel
	Name         string `json:"name" gorm:"column:name;"`
	Slug         string `json:"slug" gorm:"column:slug;"`
	Image        string `json:"image" gorm:"column:image;"`
	Description  string `json:"description" gorm:"column:description;"`
	DisplayOrder int    `json:"display_order" gorm:"column:display_order;"`
	Status       int    `json:"status" gorm:"column:status;default:1;"`
}

func (Category) TableName() string { return "categories" }
