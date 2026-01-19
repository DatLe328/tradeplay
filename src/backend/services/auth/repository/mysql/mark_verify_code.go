package mysql

import (
	"context"
	"time"
	"tradeplay/services/auth/entity"
)

func (repo *mysqlRepo) MarkCodeAsUsed(ctx context.Context, id int) error {
	updates := map[string]interface{}{
		"is_used": true,
		"used_at": time.Now(),
	}

	if err := repo.db.WithContext(ctx).
		Model(&entity.VerifyCode{}).
		Where("id = ?", id).
		Updates(updates).Error; err != nil {
		return err
	}

	return nil
}
