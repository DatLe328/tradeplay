package mysql

import (
	"context"
	"time"
	"tradeplay/common"
	"tradeplay/services/auth/entity"
)

func (repo *mysqlRepo) CreateVerifyCode(ctx context.Context, data *entity.VerifyCode) error {
	if err := repo.db.Create(data).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}

func (repo *mysqlRepo) DeleteVerifyCode(ctx context.Context, id int32) error {
	if err := repo.db.Table(entity.VerifyCode{}.TableName()).
		Where("id = ?", id).
		Delete(nil).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}

func (repo *mysqlRepo) MarkCodeAsUsed(ctx context.Context, id int32) error {
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
