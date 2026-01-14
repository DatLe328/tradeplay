package mysql

import (
	"context"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) AddAuth(ctx context.Context, data *entity.Auth) error {
	if err := repo.db.Table(data.TableName()).Create(&data).Error; err != nil {
		return core.ErrDB(err)
	}

	return nil
}
