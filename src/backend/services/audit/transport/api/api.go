package api

import (
	"context"
	"tradeplay/services/audit/entity"
)

type business interface {
	GetAuditLogs(
		ctx context.Context,
		filter *entity.AuditLogFilter,
		paging *entity.Paging,
	) ([]entity.AuditLog, error)
}

type api struct {
	business business
}

func NewAuditAPI(business business) *api {
	return &api{
		business: business,
	}
}
