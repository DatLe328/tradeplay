package mysql

import (
	"context"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) UpdateAuthStatus(ctx context.Context, email string, status entity.AuthStatus) error {
	dataTmp := entity.Auth{}
	if err := repo.db.Table(dataTmp.TableName()).
		Where("email = ?", email).
		Update("status", status).Error; err != nil {
		return core.ErrDB(err)
	}
	return nil
}
