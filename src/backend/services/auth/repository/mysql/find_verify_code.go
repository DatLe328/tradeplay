package mysql

import (
	"context"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) FindVerifyCode(ctx context.Context, email, code, typeCode string) (*entity.VerifyCode, error) {
	var data entity.VerifyCode

	if err := repo.db.Where("email = ? AND code = ? AND type = ?", email, code, typeCode).
		Order("created_at desc").
		First(&data).Error; err != nil {
		return nil, core.ErrEntityNotFound(data.TableName(), err)
	}

	return &data, nil
}

func (repo *mysqlRepo) FindAvailableVerifyCode(ctx context.Context, email, code string, verifyType entity.VerifyType) (*entity.VerifyCode, error) {
	var data entity.VerifyCode

	if err := repo.db.WithContext(ctx).
		Where("email = ? AND code = ? AND type = ? AND is_used = ?", email, code, verifyType, false).
		Order("created_at desc").
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}
