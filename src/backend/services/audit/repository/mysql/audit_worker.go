package mysql

import (
	"context"
	"encoding/json"
	"log"
	"tradeplay/services/audit/entity"

	"github.com/redis/go-redis/v9"
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

	err := repo.redis.GetClient().XAdd(ctx, &redis.XAddArgs{
		Stream: "audit_log_stream",
		MaxLen: 1000,
		Approx: true,
		Values: data,
	}).Err()

	if err != nil {
		log.Printf("[AUDIT ERROR] Failed to push to Redis Stream: %v", err)
	}
}
