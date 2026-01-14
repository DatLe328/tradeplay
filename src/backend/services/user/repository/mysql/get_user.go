package mysql

import (
	"context"
	"errors"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (repo *mysqlRepo) GetUserByID(ctx context.Context, id int) (*userEntity.User, error) {
	var data userEntity.User

	if err := repo.db.Table(data.TableName()).
		Where("id = ?", id).
		First(&data).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.ErrEntityNotFound(data.TableName(), err)
		}
		return nil, core.ErrDB(err)
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
