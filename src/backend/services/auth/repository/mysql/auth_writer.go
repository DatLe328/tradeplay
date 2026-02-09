package mysql

import (
	"context"
	"time"
	"tradeplay/common"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"gorm.io/gorm"
)

func (repo *mysqlRepo) CreateAuth(ctx context.Context, data *authEntity.Auth) error {
	if err := repo.db.Table(data.TableName()).Create(&data).Error; err != nil {
		return common.ErrDB(err)
	}

	return nil
}

func (repo *mysqlRepo) UpdateAuthStatus(ctx context.Context, email string, status authEntity.AuthStatus) error {
	dataTmp := authEntity.Auth{}
	if err := repo.db.Table(dataTmp.TableName()).
		Where("email = ?", email).
		Update("status", status).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}

func (repo *mysqlRepo) UpdateAuth(ctx context.Context, data *authEntity.Auth) error {
	if err := repo.db.Save(data).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}

func (repo *mysqlRepo) CreateUserAndAuthGoogle(ctx context.Context, user *userEntity.User, auth *authEntity.Auth) error {
	// Set transaction timeout to 20 seconds for auth creation
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	return repo.db.WithContext(ctxWithTimeout).Transaction(func(tx *gorm.DB) error {
		if err := tx.Table(userEntity.User{}.TableName()).Create(user).Error; err != nil {
			return err
		}

		auth.UserID = user.ID

		if err := tx.Table(authEntity.Auth{}.TableName()).Create(auth).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *mysqlRepo) VerifyUserTransaction(ctx context.Context, email string, userID int32) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Table(authEntity.Auth{}.TableName()).
			Where("email = ? AND auth_type = ?", email, authEntity.AuthTypeEmailPassword).
			Update("status", authEntity.AuthStatusVerified).Error; err != nil {
			return err
		}

		if err := tx.Table(userEntity.User{}.TableName()).
			Where("id = ?", userID).
			Update("status", userEntity.StatusActive).Error; err != nil {
			return err
		}

		return nil
	})
}
