package mysql

import (
	"context"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) CreateVerifyCode(ctx context.Context, data *entity.VerifyCode) error {
	if err := repo.db.Create(data).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
