package mysql

import (
	"context"
	"errors"
	"tradeplay/common"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) GetUserByID(ctx context.Context, id int32) (*userEntity.User, error) {
	var data userEntity.User

	if err := repo.db.Table(data.TableName()).
		Where("id = ?", id).
		First(&data).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, common.ErrEntityNotFound(data.TableName(), err)
		}
		return nil, common.ErrDB(err)
	}
	var email string
	authTmp := new(authEntity.Auth)
	if err := repo.db.Table(authTmp.TableName()).
		Select("email").
		Where("user_id = ?", id).
		Take(&email).Error; err == nil {

		data.Email = email
	}
	return &data, nil
}
