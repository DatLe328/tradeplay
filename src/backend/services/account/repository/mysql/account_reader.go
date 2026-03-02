package mysql

import (
	"context"
	"fmt"
	"strconv"
	"strings"
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

	sort := "id desc"
	sortKey := ""
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

		sortKey = filter.Sort
		switch filter.Sort {
		case "price_asc":
			sort = "price asc, id asc"
		case "price_desc":
			sort = "price desc, id desc"
		default:
			sort = "id desc"
		}
	}

	// Apply cursor
	if paging.Cursor != "" {
		parts := strings.SplitN(paging.Cursor, ":", 2)
		switch sortKey {
		case "price_asc":
			if len(parts) == 2 {
				cp, _ := strconv.ParseInt(parts[0], 10, 64)
				ci, _ := strconv.ParseInt(parts[1], 10, 32)
				db = db.Where("price > ? OR (price = ? AND id > ?)", cp, cp, int32(ci))
			}
		case "price_desc":
			if len(parts) == 2 {
				cp, _ := strconv.ParseInt(parts[0], 10, 64)
				ci, _ := strconv.ParseInt(parts[1], 10, 32)
				db = db.Where("price < ? OR (price = ? AND id < ?)", cp, cp, int32(ci))
			}
		default:
			if len(parts) == 1 {
				ci, _ := strconv.ParseInt(parts[0], 10, 32)
				db = db.Where("id < ?", int32(ci))
			}
		}
	}

	if err := db.Preload("Category").
		Order(sort).
		Limit(paging.Limit + 1).
		Find(&result).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	// Compute next cursor from the (limit+1)-th item if it exists
	if len(result) > paging.Limit {
		paging.HasMore = true
		last := result[paging.Limit-1]
		switch sortKey {
		case "price_asc", "price_desc":
			paging.NextCursor = fmt.Sprintf("%d:%d", last.Price, last.ID)
		default:
			paging.NextCursor = fmt.Sprintf("%d", last.ID)
		}
		result = result[:paging.Limit]
	}

	return result, nil
}
