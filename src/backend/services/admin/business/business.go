package business

import (
	"context"
	"tradeplay/services/admin/entity"
)

type AdminRepository interface {
	GetSystemStats(ctx context.Context) (*entity.AdminStats, error)
}

type business struct {
	adminRepo AdminRepository
}

func NewAdminBusiness(adminRepo AdminRepository) *business {
	return &business{
		adminRepo: adminRepo,
	}
}
