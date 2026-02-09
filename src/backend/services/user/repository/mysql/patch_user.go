package mysql

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/user/entity"
)

func (repo *mysqlRepo) PatchUserByID(
	ctx context.Context,
	id int32,
	data map[string]interface{},
) error {
	if len(data) == 0 {
		return nil
	}
	if err := repo.db.Table(
		entity.User{}.TableName()).
		Where("id = ?", id).
		Updates(&data).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}
