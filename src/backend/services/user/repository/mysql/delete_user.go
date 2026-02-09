package mysql

import (
	"context"
	userEntity "tradeplay/services/user/entity"
)

func (repo *mysqlRepo) DeleteUser(ctx context.Context, id int) error {
	if err := repo.db.WithContext(ctx).Unscoped().Delete(&userEntity.User{}, id).Error; err != nil {
		return err
	}
	return nil
}
