package redisc

import (
	"context"

	"github.com/redis/go-redis/v9"
)

func (r *redisOpt) Produce(ctx context.Context, stream string, data map[string]interface{}) error {
	return r.client.XAdd(ctx, &redis.XAddArgs{
		Stream: stream,
		MaxLen: 1000,
		Approx: true,
		Values: data,
	}).Err()
}

func (r *redisOpt) Consume(ctx context.Context, stream, group, consumer string, handler func(map[string]interface{}) error) {
	r.client.XGroupCreateMkStream(ctx, stream, group, "0")

	go func() {
		for {
			entries, _ := r.client.XReadGroup(ctx, &redis.XReadGroupArgs{
				Group:    group,
				Consumer: consumer,
				Streams:  []string{stream, ">"},
				Count:    1,
				Block:    0,
			}).Result()

			for _, entry := range entries {
				for _, msg := range entry.Messages {
					if err := handler(msg.Values); err == nil {
						r.client.XAck(ctx, stream, group, msg.ID)
					}
				}
			}
		}
	}()
}
