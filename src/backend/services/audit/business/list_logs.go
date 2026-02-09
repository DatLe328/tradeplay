package business

import (
	"context"
	"tradeplay/services/audit/entity"
)

func (biz *business) GetAuditLogs(
	ctx context.Context,
	filter *entity.AuditLogFilter,
	paging *entity.Paging,
) ([]entity.AuditLog, error) {
	paging.Process()

	logs, err := biz.repo.ListAuditLogs(ctx, filter, paging)
	if err != nil {
		return nil, err
	}
	for i := range logs {
		logs[i].Mask()
	}

	return logs, nil
}
