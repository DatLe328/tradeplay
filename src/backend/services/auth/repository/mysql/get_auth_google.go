package mysql

import (
	"context"
	"tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (repo *mysqlRepo) FindAuthByGoogleIDOrEmail(ctx context.Context, googleID, email string) (*entity.Auth, error) {
	var auth entity.Auth
	err := repo.db.Table(entity.Auth{}.TableName()).
		Where("google_id = ? OR email = ?", googleID, email).
		First(&auth).Error

	if err != nil {
		return nil, core.ErrDB(err)
	}
	return &auth, nil
}

func (repo *mysqlRepo) CreateUserAndAuthGoogle(ctx context.Context, user *userEntity.User, auth *entity.Auth) error {
	return repo.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Table(userEntity.User{}.TableName()).Create(user).Error; err != nil {
			return err
		}

		auth.UserID = int64(user.Id)

		if err := tx.Table(entity.Auth{}.TableName()).Create(auth).Error; err != nil {
			return err
		}

		return nil
	})
}

func (repo *mysqlRepo) UpdateAuthGoogleID(ctx context.Context, id int, googleID string) error {
	return repo.db.Table(entity.Auth{}.TableName()).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"google_id": googleID,
		}).Error
}
