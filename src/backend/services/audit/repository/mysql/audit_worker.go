package mysql

import (
	"context"
	"encoding/json"
	"log"
	"tradeplay/services/audit/entity"
)

func (repo *mysqlRepo) PushAuditLog(ctx context.Context, entry *entity.AuditLog) {
	payloadStr, _ := json.Marshal(entry.Payload)

	data := map[string]interface{}{
		"user_id":     entry.UserId,
		"action":      entry.Action,
		"method":      entry.Method,
		"path":        entry.Path,
		"status_code": entry.StatusCode,
		"payload":     string(payloadStr),
		"ip_address":  entry.IpAddress,
	}

	if err := repo.redis.Produce(ctx, "audit_log_stream", data); err != nil {
		log.Printf("[AUDIT ERROR] Failed to push to Redis Stream: %v", err)
	}
}
