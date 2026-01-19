package mysql

import (
	"context"
	"tradeplay/services/wallet/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) GetWalletByUserID(ctx context.Context, userId int, currency string) (*entity.Wallet, error) {
	var wallet entity.Wallet

	if err := repo.db.Where("user_id = ? AND currency = ?", userId, currency).First(&wallet).Error; err != nil {
		return nil, err
	}

	return &wallet, nil
}

func (repo *mysqlRepo) CreateWallet(ctx context.Context, wallet *entity.Wallet) error {
	return repo.db.Table(entity.Wallet{}.TableName()).Create(wallet).Error
}

func (repo *mysqlRepo) GetWalletForUpdate(ctx context.Context, tx *gorm.DB, userId int, currency string) (*entity.Wallet, error) {
	var wallet entity.Wallet

	db := repo.db
	if tx != nil {
		db = tx
	}

	if err := db.Set("gorm:query_option", "FOR UPDATE").
		Where("user_id = ? AND currency = ?", userId, currency).
		First(&wallet).Error; err != nil {
		return nil, err
	}

	return &wallet, nil
}
