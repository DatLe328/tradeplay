package mysql

import (
	"context"
	"time"
	"tradeplay/common"
	"tradeplay/services/audit/entity"
)

func (repo *mysqlRepo) ListAuditLogs(
	ctx context.Context,
	filter *entity.AuditLogFilter,
	paging *entity.Paging,
) ([]entity.AuditLog, error) {
	var logs []entity.AuditLog

	db := repo.db.Table(entity.AuditLog{}.TableName())

	if filter.UserId > 0 {
		db = db.Where("user_id = ?", filter.UserId)
	}
	if filter.Action != "" {
		db = db.Where("action = ?", filter.Action)
	}
	if filter.Method != "" {
		db = db.Where("method = ?", filter.Method)
	}
	if filter.StatusCode > 0 {
		db = db.Where("status_code = ?", filter.StatusCode)
	}
	if filter.IpAddress != "" {
		db = db.Where("ip_address LIKE ?", filter.IpAddress+"%")
	}

	if filter.DateFrom != "" {
		if t, err := time.Parse("2006-01-02", filter.DateFrom); err == nil {
			db = db.Where("created_at >= ?", t)
		}
	}
	if filter.DateTo != "" {
		if t, err := time.Parse("2006-01-02", filter.DateTo); err == nil {
			db = db.Where("created_at < ?", t.Add(24*time.Hour))
		}
	}

	if err := db.Count(&paging.Total).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	offset := (paging.Page - 1) * paging.Limit

	if err := db.Offset(offset).
		Limit(paging.Limit).
		Order("id DESC").
		Find(&logs).Error; err != nil {
		return nil, common.ErrDB(err)
	}

	return logs, nil
}
