package mysql

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/user/entity"
)

func (repo *mysqlRepo) CreateUser(ctx context.Context, data *entity.UserCreateDTO) (int32, error) {
	if err := repo.db.Table(data.TableName()).Create(&data).Error; err != nil {
		return 0, common.ErrCannotDeleteEntity(data.TableName(), err)
	}
	return data.ID, nil
}
