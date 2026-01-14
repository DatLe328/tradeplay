package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) DeleteAccount(ctx context.Context, id int) error {
	if err := repo.db.Table(entity.Account{}.TableName()).
		Where("id = ?", id).
		Delete(&entity.Account{}).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
