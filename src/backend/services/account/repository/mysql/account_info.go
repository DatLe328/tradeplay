package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"gorm.io/gorm"
)

func (r *mysqlRepo) CreateAccountInfo(ctx context.Context, tx *gorm.DB, data *entity.AccountInfo) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	if err := db.Create(data).Error; err != nil {
		return err
	}
	return nil
}

func (r *mysqlRepo) GetAccountInfoByAccountID(ctx context.Context, accountId int) (*entity.AccountInfo, error) {
	var data entity.AccountInfo

	if err := r.db.Where("account_id = ?", accountId).First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (r *mysqlRepo) UpdateAccountInfo(ctx context.Context, tx *gorm.DB, accountId int, data *entity.AccountInfo) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	if err := db.Model(&entity.AccountInfo{}).
		Where("account_id = ?", accountId).
		Updates(data).Error; err != nil {
		return err
	}

	return nil
}
