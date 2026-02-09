package business

import (
	"context"
	"tradeplay/services/audit/entity"
)

type auditRepository interface {
	ListAuditLogs(ctx context.Context, filter *entity.AuditLogFilter, paging *entity.Paging) ([]entity.AuditLog, error)
}

type business struct {
	repo auditRepository
}

func NewBusiness(repo auditRepository) *business {
	return &business{
		repo: repo,
	}
}
