package entity

import "tradeplay/common"

type AccountInfo struct {
	common.SQLModel
	AccountId int32  `gorm:"column:account_id;unique;not null"`
	Username  string `json:"-" gorm:"column:username;type:varchar(255)"`
	Password  string `json:"-" gorm:"column:password;type:varchar(255)"`
	Email     string `json:"-" gorm:"column:email;type:varchar(255)"`
	ExtraData string `json:"-" gorm:"column:extra_data;type:text"`
}

func (AccountInfo) TableName() string {
	return "account_infos"
}
