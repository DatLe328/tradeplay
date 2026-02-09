package mysql

import (
	"tradeplay/common"

	"gorm.io/gorm"
)

type mysqlRepo struct {
	db    *gorm.DB
	redis common.RedisComponent
}

func NewMySQLRepository(db *gorm.DB, redis common.RedisComponent) *mysqlRepo {
	repo := &mysqlRepo{
		db:    db,
		redis: redis,
	}

	return repo
}
