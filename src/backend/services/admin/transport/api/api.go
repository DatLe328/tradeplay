package api

import (
	"context"
	"tradeplay/services/admin/entity"
)

type Business interface {
	GetSystemStats(ctx context.Context) (*entity.AdminStats, error)
}

type api struct {
	business Business
}

func NewAdminAPI(business Business) *api {
	return &api{
		business: business,
	}
}
