package mysql

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) GetAccountList(
	ctx context.Context,
	filter *entity.Filter,
	paging *core.Paging,
) ([]entity.Account, error) {
	var result []entity.Account
	db := repo.db.Table(entity.Account{}.TableName())

	if filter != nil {
		if filter.OwnerId > 0 {
			db = db.Where("owner_id = ?", filter.OwnerId)
		}

		if len(filter.GameName) > 0 {
			db = db.Where("game_name LIKE ?", "%"+filter.GameName+"%")
		}

		if len(filter.Status) > 0 {
			db = db.Where("status IN ?", filter.Status)
		}

		if filter.MinPrice != nil {
			db = db.Where("price >= ?", *filter.MinPrice)
		}

		if filter.MaxPrice != nil {
			db = db.Where("price <= ?", *filter.MaxPrice)
		}
		if len(filter.Search) > 0 {
			db = db.Where("title LIKE ? OR description LIKE ? OR CAST(id AS CHAR) LIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%")
		}
	}

	if err := db.Count(&paging.Total).Error; err != nil {
		return nil, core.ErrDB(err)
	}

	if err := db.Preload("User").
		Offset((paging.Page - 1) * paging.Limit).
		Limit(paging.Limit).
		Order("id desc").
		Find(&result).Error; err != nil {
		return nil, core.ErrDB(err)
	}

	return result, nil
}
