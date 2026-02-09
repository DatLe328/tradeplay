package composer

import (
	"context"
	"encoding/json"
	"strconv"
	"tradeplay/common"
	"tradeplay/services/audit/entity"

	sctx "tradeplay/components/service-context"

	"github.com/redis/go-redis/v9"
)

func RunAuditWorker(serviceCtx sctx.ServiceContext) {
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)
	db := serviceCtx.MustGet(common.KeyCompMySQL).(common.GormComponent).GetDB()

	go func() {
		ctx := context.Background()
		redisComp.GetClient().XGroupCreateMkStream(ctx, "audit_log_stream", "audit_group", "0")

		for {
			streams, err := redisComp.GetClient().XReadGroup(ctx, &redis.XReadGroupArgs{
				Group:    "audit_group",
				Consumer: "audit_worker_1",
				Streams:  []string{"audit_log_stream", ">"},
				Count:    1,
				Block:    0,
			}).Result()

			if err != nil {
				continue
			}

			for _, stream := range streams {
				for _, msg := range stream.Messages {
					userID, _ := strconv.Atoi(msg.Values["user_id"].(string))
					statusCode, _ := strconv.Atoi(msg.Values["status_code"].(string))

					var payload entity.JSONMap
					_ = json.Unmarshal([]byte(msg.Values["payload"].(string)), &payload)

					entry := entity.AuditLog{
						UserId:     int32(userID),
						Action:     msg.Values["action"].(string),
						Method:     msg.Values["method"].(string),
						Path:       msg.Values["path"].(string),
						StatusCode: statusCode,
						Payload:    payload,
						IpAddress:  msg.Values["ip_address"].(string),
					}

					if err := db.Create(&entry).Error; err == nil {
						redisComp.GetClient().XAck(ctx, "audit_log_stream", "audit_group", msg.ID)
					}
				}
			}
		}
	}()
}
