package mysql

import (
	"context"
	"log"
	"time"
	"tradeplay/common"
	"tradeplay/services/auth/entity"
)

func (s *mysqlRepo) CreateUserToken(ctx context.Context, data *entity.UserToken) error {
	if err := s.db.Create(data).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}

func (s *mysqlRepo) GetUserToken(ctx context.Context, tokenID string) (*entity.UserToken, error) {
	var token entity.UserToken
	if err := s.db.Where("token_id = ?", tokenID).First(&token).Error; err != nil {
		return nil, common.ErrCannotGetEntity(token.TableName(), err)
	}
	return &token, nil
}

func (r *mysqlRepo) RevokeUserToken(ctx context.Context, tokenID string) error {
	return r.db.WithContext(ctx).
		Model(&entity.UserToken{}).
		Where("token_id = ?", tokenID).
		Update("is_revoked", true).Error
}

func (r *mysqlRepo) RevokeAllUserTokens(ctx context.Context, userID int32) error {
	return r.db.WithContext(ctx).
		Model(&entity.UserToken{}).
		Where("user_id = ? AND is_revoked = ?", userID, false).
		Update("is_revoked", true).Error
}

func (s *mysqlRepo) DeleteUserToken(ctx context.Context, tokenID string) error {
	if err := s.db.Where("token_id = ?", tokenID).Delete(&entity.UserToken{}).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}

func (s *mysqlRepo) DeleteExpiredTokens(ctx context.Context, userID int32) error {
	log.Println("Cleaning up tokens for user ID:", userID)

	batchSize := 100
	now := time.Now()
	revokeThreshold := now.Add(-24 * time.Hour)

	for {
		var tokensToDelete []entity.UserToken
		if err := s.db.Select("id").
			Where("user_id = ? AND (expires_at < ? OR (is_revoked = ? AND updated_at < ?))",
				userID, now, true, revokeThreshold).
			Limit(batchSize).
			Find(&tokensToDelete).Error; err != nil {
			return common.ErrDB(err)
		}

		if len(tokensToDelete) == 0 {
			break
		}

		ids := make([]int32, len(tokensToDelete))
		for i, token := range tokensToDelete {
			ids[i] = token.ID
		}

		if err := s.db.Where("id IN ?", ids).Delete(&entity.UserToken{}).Error; err != nil {
			return common.ErrDB(err)
		}

		time.Sleep(10 * time.Millisecond)
	}

	return nil
}
