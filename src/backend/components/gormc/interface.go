package gormc

import "gorm.io/gorm"

type DBComponent interface {
	GetDB() *gorm.DB
}
