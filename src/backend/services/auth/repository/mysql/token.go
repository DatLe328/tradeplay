package mysql

import (
	"context"
	"log"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (s *mysqlRepo) CreateUserToken(ctx context.Context, data *entity.UserToken) error {
	if err := s.db.Create(data).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}

func (s *mysqlRepo) FindUserToken(ctx context.Context, tokenID string) (*entity.UserToken, error) {
	var token entity.UserToken

	if err := s.db.Where("token_id = ?", tokenID).First(&token).Error; err != nil {
		return nil, core.ErrCannotGetEntity(token.TableName(), err)
	}

	return &token, nil
}

func (s *mysqlRepo) DeleteUserToken(ctx context.Context, tokenID string) error {
	if err := s.db.Where("token_id = ?", tokenID).Delete(&entity.UserToken{}).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}

func (s *mysqlRepo) DeleteExpiredTokens(ctx context.Context, userId int) error {
	log.Println("Deleting expired tokens for user ID:", userId)
	if err := s.db.Where("user_id = ? AND expires_at < NOW()", userId).Delete(&entity.UserToken{}).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
