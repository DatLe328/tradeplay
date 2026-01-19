package mysql

import (
	"context"
	"tradeplay/services/wallet/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) CreateWalletTransaction(ctx context.Context, tx *gorm.DB, data *entity.WalletTransaction) error {
	db := repo.db
	if tx != nil {
		db = tx
	}
	return db.Create(data).Error
}
