package mysql

import (
	"context"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) CreateUser(ctx context.Context, data *entity.UserDataCreation) (int, error) {
	if err := repo.db.Table(data.TableName()).Create(&data).Error; err != nil {
		return 0, core.ErrCannotDeleteEntity(data.TableName(), err)
	}
	return data.Id, nil
}
