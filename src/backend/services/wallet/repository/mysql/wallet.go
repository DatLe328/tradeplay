package mysql

import (
	"context"
	"tradeplay/services/wallet/entity"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (repo *mysqlRepo) GetWalletByUserID(
	ctx context.Context,
	userID int32,
) (*entity.Wallet, error) {
	var wallet entity.Wallet

	if err := repo.db.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		return nil, err
	}

	return &wallet, nil
}

func (repo *mysqlRepo) CreateWallet(
	ctx context.Context,
	userID int32,
) error {
	wallet := entity.NewWallet(userID)
	return repo.db.Table(entity.Wallet{}.TableName()).Create(wallet).Error
}

func (repo *mysqlRepo) GetWalletForUpdate(
	ctx context.Context,
	tx *gorm.DB,
	userID int32,
) (*entity.Wallet, error) {
	var wallet entity.Wallet

	db := repo.db
	if tx != nil {
		db = tx
	}

	if err := db.WithContext(ctx).
		Table(wallet.TableName()).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ?", userID).
		First(&wallet).Error; err != nil {
		return nil, err
	}

	return &wallet, nil
}
