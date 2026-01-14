package mysql

import (
	"context"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) DeleteVerifyCode(ctx context.Context, id int) error {
	if err := repo.db.Table(entity.VerifyCode{}.TableName()).
		Where("id = ?", id).
		Delete(nil).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
