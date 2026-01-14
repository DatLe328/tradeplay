package mysql

import (
	"context"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) PatchUserByID(
	ctx context.Context,
	id int,
	data map[string]interface{},
) error {
	if len(data) == 0 {
		return nil
	}
	if err := repo.db.Table(
		entity.User{}.TableName()).
		Where("id = ?", id).
		Updates(&data).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
