package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) UpdateAccount(ctx context.Context, tx *gorm.DB, id int, data *entity.AccountDataUpdate) error {
	db := repo.db
	if tx != nil {
		db = tx
	}

	return db.Model(&entity.Account{}).
		Where("id = ?", id).
		Updates(data).Error
}
