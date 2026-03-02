package mysql

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (repo *mysqlRepo) GetAccountByID(
	ctx context.Context,
	id int32,
) (*entity.Account, error) {
	var data entity.Account

	err := repo.db.WithContext(ctx).
		Table(entity.Account{}.TableName()).
		Preload("Category").
		Where("id = ?", id).
		First(&data).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, common.ErrDB(err)
	}

	return &data, nil
}

func (repo *mysqlRepo) GetAccountByIDForUpdate(ctx context.Context, id int32) (*entity.Account, error) {
	var data entity.Account

	if err := repo.getDB(ctx).WithContext(ctx).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id = ?", id).
		First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (repo *mysqlRepo) FindAccounts(
	ctx context.Context,
	filter *entity.Filter,
	paging *common.Paging,
) ([]entity.Account, error) {
	var result []entity.Account
	db := repo.db.Table(entity.Account{}.TableName())

	if filter != nil {
		if filter.OwnerId > 0 {
			db = db.Where("owner_id = ?", filter.OwnerId)
		}

		if filter.CategoryId > 0 {
			db = db.Where("category_id = ?", filter.CategoryId)
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
			db = db.Where("title LIKE ? OR description LIKE ? OR CAST(id AS CHAR) LIKE ?",
				"%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%")
		}

		switch filter.Sort {
		case "price_asc":
			db = db.Order("price asc")
		case "price_desc":
			db = db.Order("price desc")
		default:
			db = db.Order("id desc")
		}
	}

	if err := db.Count(&paging.Total).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	if err := db.Preload("Category").
		Offset((paging.Page - 1) * paging.Limit).
		Limit(paging.Limit).
		Find(&result).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	return result, nil
}
