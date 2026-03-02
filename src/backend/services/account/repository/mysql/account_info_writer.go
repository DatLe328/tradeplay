package mysql

import (
	"context"
	"tradeplay/services/account/entity"
)

func (r *mysqlRepo) CreateAccountInfo(
	ctx context.Context,
	data *entity.AccountInfo,
) error {
	if err := r.getDB(ctx).Create(data).Error; err != nil {
		return err
	}
	return nil
}

func (r *mysqlRepo) UpdateAccountInfo(
	ctx context.Context,
	accountId int32,
	data *entity.AccountInfo) error {

	if err := r.getDB(ctx).Model(&entity.AccountInfo{}).
		Where("account_id = ?", accountId).
		Updates(data).Error; err != nil {
		return err
	}

	return nil
}
