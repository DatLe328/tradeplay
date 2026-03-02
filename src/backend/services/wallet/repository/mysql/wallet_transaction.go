package mysql

import (
	"context"
	"tradeplay/services/wallet/entity"
)

func (repo *mysqlRepo) CreateWalletTransaction(
	ctx context.Context,
	data *entity.WalletTransaction,
) error {
	return repo.getDB(ctx).WithContext(ctx).
		Table(data.TableName()).
		Create(data).Error
}
