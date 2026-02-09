package mysql

import (
	"context"
	"tradeplay/services/auth/entity"
)

func (repo *mysqlRepo) GetAvailableVerifyCode(ctx context.Context, email, code string, verifyType entity.VerifyType) (*entity.VerifyCode, error) {
	var data entity.VerifyCode

	if err := repo.db.WithContext(ctx).
		Where("email = ? AND code = ? AND type = ? AND is_used = ?", email, code, verifyType, false).
		Order("created_at desc").
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}
