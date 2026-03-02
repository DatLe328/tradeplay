package composer

import (
	"context"
	"encoding/json"
	"strconv"
	"tradeplay/common"
	"tradeplay/components/gormc"
	"tradeplay/services/audit/entity"

	sctx "tradeplay/pkg/service-context"
)

func RunAuditWorker(serviceCtx sctx.ServiceContext) {
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.StreamBroker)
	db := serviceCtx.MustGet(common.KeyCompMySQL).(gormc.DBComponent).GetDB()

	ctx := context.Background()
	redisComp.Consume(ctx, "audit_log_stream", "audit_group", "audit_worker_1", func(data map[string]interface{}) error {
		userID, _ := strconv.Atoi(data["user_id"].(string))
		statusCode, _ := strconv.Atoi(data["status_code"].(string))

		var payload entity.JSONMap
		_ = json.Unmarshal([]byte(data["payload"].(string)), &payload)

		entry := entity.AuditLog{
			UserId:     int32(userID),
			Action:     data["action"].(string),
			Method:     data["method"].(string),
			Path:       data["path"].(string),
			StatusCode: statusCode,
			Payload:    payload,
			IpAddress:  data["ip_address"].(string),
		}

		return db.Create(&entry).Error
	})
}
