package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (repo *mysqlRepo) CreateAccount(ctx context.Context, tx *gorm.DB, data *entity.Account) error {
	db := repo.db

	if tx != nil {
		db = tx
	}

	if err := db.Table(data.TableName()).Create(&data).Error; err != nil {
		return core.ErrDB(err)
	}

	return nil
}
