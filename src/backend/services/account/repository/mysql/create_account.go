package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) CreateAccount(ctx context.Context, data *entity.Account) error {
	if err := repo.db.Table(data.TableName()).Create(&data).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
