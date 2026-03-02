package mysql

import (
	"context"
	"encoding/json"
	"errors"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"gorm.io/datatypes"
)

func (repo *mysqlRepo) CreateAccount(
	ctx context.Context,
	data *entity.Account,
) error {
	data.Version = 0

	if err := repo.getDB(ctx).Table(data.TableName()).Create(&data).Error; err != nil {
		return common.ErrDB(err)
	}

	return nil
}

func (repo *mysqlRepo) UpdateAccount(
	ctx context.Context,
	id int32,
	data *entity.AccountDataUpdate,
	currentVersion int,
) error {
	updates := map[string]interface{}{
		"version": currentVersion + 1,
	}
	if data.Title != nil {
		updates["title"] = *data.Title
	}
	if data.Description != nil {
		updates["description"] = *data.Description
	}
	if data.Price != nil {
		updates["price"] = *data.Price
	}
	if data.OriginalPrice != nil {
		updates["original_price"] = *data.OriginalPrice
	}
	if data.Thumbnail != nil {
		updates["thumbnail"] = *data.Thumbnail
	}
	if data.Status != nil {
		updates["status"] = *data.Status
	}
	if data.CategoryID != nil {
		updates["category_id"] = *data.CategoryID
	}

	// Handle images serialization
	if data.Images != nil {
		imagesJSON, err := json.Marshal(data.Images)
		if err != nil {
			return common.ErrDB(err)
		}
		updates["images"] = datatypes.JSON(imagesJSON)
	}

	// Handle attributes serialization
	if data.Attributes != nil {
		attrsJSON, err := json.Marshal(data.Attributes)
		if err != nil {
			return common.ErrDB(err)
		}
		updates["attributes"] = datatypes.JSON(attrsJSON)
	}

	// Handle features serialization
	if data.Features != nil {
		featuresJSON, err := json.Marshal(data.Features)
		if err != nil {
			return common.ErrDB(err)
		}
		updates["features"] = datatypes.JSON(featuresJSON)
	}

	result := repo.getDB(ctx).Model(&entity.Account{}).
		Where("id = ? AND version = ?", id, currentVersion).
		Updates(updates)

	if err := result.Error; err != nil {
		return common.ErrDB(err)
	}

	if result.RowsAffected == 0 {
		return errors.New("data has been updated by another process, please refresh")
	}

	return nil
}

func (repo *mysqlRepo) DeleteAccount(
	ctx context.Context,
	id int32,
) error {
	if err := repo.db.Table(entity.Account{}.TableName()).
		Where("id = ?", id).
		Delete(&entity.Account{}).Error; err != nil {
		return common.ErrDB(err)
	}
	return nil
}
