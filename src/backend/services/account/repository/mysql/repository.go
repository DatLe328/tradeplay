package mysql

import "gorm.io/gorm"

type mysqlRepo struct {
	db *gorm.DB
}

func NewMySQLRepository(db *gorm.DB) *mysqlRepo {
	return &mysqlRepo{db: db}
}

func (repo *mysqlRepo) GetDB() *gorm.DB {
	return repo.db
}
