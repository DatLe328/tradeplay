package mysql

import (
	"context"
	"tradeplay/services/account/entity"
)

func (r *mysqlRepo) GetAccountInfoByAccountID(ctx context.Context, accountId int32) (*entity.AccountInfo, error) {
	var data entity.AccountInfo

	if err := r.db.Where("account_id = ?", accountId).First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}
