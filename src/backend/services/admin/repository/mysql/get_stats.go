package mysql

import (
	"context"
	adminEntity "tradeplay/services/admin/entity"

	"github.com/DatLe328/service-context/core"
)

func (repo *mysqlRepo) GetSystemStats(ctx context.Context) (*adminEntity.AdminStats, error) {
	var stats adminEntity.AdminStats

	if err := repo.db.Table("accounts").Count(&stats.TotalAccounts).Error; err != nil {
		return nil, core.ErrDB(err)
	}
	if err := repo.db.Table("accounts").Where("status = ?", "available").Count(&stats.AvailableAccounts).Error; err != nil {
		return nil, core.ErrDB(err)
	}
	if err := repo.db.Table("accounts").Where("status = ?", "sold").Count(&stats.SoldAccounts).Error; err != nil {
		return nil, core.ErrDB(err)
	}

	if err := repo.db.Table("orders").Where("status = ?", "pending").Count(&stats.PendingOrders).Error; err != nil {
		return nil, core.ErrDB(err)
	}

	type Result struct {
		Total float64
	}
	var res Result
	if err := repo.db.Table("orders").
		Select("COALESCE(SUM(total_price), 0) as total").
		Where("status IN ?", []string{"paid", "delivered"}).
		Scan(&res).Error; err != nil {
		return nil, core.ErrDB(err)
	}
	stats.TotalRevenue = res.Total

	return &stats, nil
}
