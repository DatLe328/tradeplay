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

func (repo *mysqlRepo) FindAuthByEmailAndType(ctx context.Context, email string, authType entity.AuthType) (*entity.Auth, error) {
	var data entity.Auth

	if err := repo.db.WithContext(ctx).
		Where("email = ? AND auth_type = ?", email, authType).
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (repo *mysqlRepo) FindAuthByGoogleID(ctx context.Context, googleID string) (*entity.Auth, error) {
	var data entity.Auth
	if err := repo.db.WithContext(ctx).
		Where("google_id = ? AND auth_type = ?", googleID, entity.AuthTypeGoogle).
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}
