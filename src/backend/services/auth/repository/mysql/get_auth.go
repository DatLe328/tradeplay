package mysql

import (
	"context"
	"errors"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (repo *mysqlRepo) GetAuth(ctx context.Context, email string) (*entity.Auth, error) {
	var data entity.Auth

	if err := repo.db.Table(data.TableName()).Where("email = ?", email).First(&data).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, entity.ErrUserNotFound
		}
		return nil, core.ErrDB(err)
	}

	return &data, nil
}

func (s *mysqlRepo) FindAuthByUserID(ctx context.Context, userId int) (*entity.Auth, error) {
	var authData entity.Auth
	// Tìm auth record dựa trên user_id
	if err := s.db.Where("user_id = ?", userId).First(&authData).Error; err != nil {
		return nil, core.ErrCannotGetEntity(authData.TableName(), err)
	}
	return &authData, nil
}
