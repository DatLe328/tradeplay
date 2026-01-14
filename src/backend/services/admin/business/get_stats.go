package business

import (
	"context"
	"tradeplay/services/admin/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) GetSystemStats(ctx context.Context) (*entity.AdminStats, error) {
	stats, err := biz.adminRepo.GetSystemStats(ctx)
	if err != nil {
		return nil, core.ErrInternal(err)
	}
	return stats, nil
}
