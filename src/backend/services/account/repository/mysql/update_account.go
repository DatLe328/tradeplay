package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) UpdateAccount(ctx context.Context, id int, data *entity.AccountDataUpdate) error {
	if err := repo.db.Table(entity.Account{}.TableName()).
		Where("id = ?", id).
		Updates(data).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
