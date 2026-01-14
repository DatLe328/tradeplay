package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (repo *mysqlRepo) GetAccountByID(ctx context.Context, id int) (*entity.Account, error) {
	var data entity.Account

	err := repo.db.Table(entity.Account{}.TableName()).
		Where("id = ?", id).
		First(&data).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}

		return nil, core.ErrDB(err)
	}

	return &data, nil
}
