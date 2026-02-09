package mysql

import (
	"context"
	"errors"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) GetAuthByEmail(ctx context.Context, email string) (*entity.Auth, error) {
	var data entity.Auth

	if err := repo.db.Table(data.TableName()).Where("email = ?", email).First(&data).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, entity.ErrAuthNotFound
		}
		return nil, common.ErrDB(err)
	}

	return &data, nil
}

func (s *mysqlRepo) GetAuthByUserID(ctx context.Context, userID int32) (*entity.Auth, error) {
	var authData entity.Auth
	if err := s.db.Where("user_id = ?", userID).First(&authData).Error; err != nil {
		return nil, common.ErrCannotGetEntity(authData.TableName(), err)
	}
	return &authData, nil
}

func (repo *mysqlRepo) GetAuthByEmailAndType(ctx context.Context, email string, authType entity.AuthType) (*entity.Auth, error) {
	var data entity.Auth

	if err := repo.db.WithContext(ctx).
		Where("email = ? AND auth_type = ?", email, authType).
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (repo *mysqlRepo) GetAuthByGoogleID(ctx context.Context, googleID string) (*entity.Auth, error) {
	var data entity.Auth
	if err := repo.db.WithContext(ctx).
		Where("google_id = ? AND auth_type = ?", googleID, entity.AuthTypeGoogle).
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}
