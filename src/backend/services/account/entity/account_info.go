package entity

import "github.com/DatLe328/service-context/core"

type AccountInfo struct {
	core.SQLModel
	AccountId int    `json:"account_id" gorm:"column:account_id;unique;not null"`
	Username  string `json:"username" gorm:"column:username;type:varchar(255)"`
	Password  string `json:"password" gorm:"column:password;type:varchar(255)"`
	Email     string `json:"email" gorm:"column:email;type:varchar(255)"`
	ExtraData string `json:"extra_data" gorm:"column:extra_data;type:text"`
}

func (AccountInfo) TableName() string {
	return "account_infos"
}
