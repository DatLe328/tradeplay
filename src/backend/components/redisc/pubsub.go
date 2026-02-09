package redisc

import (
	"context"
	"encoding/json"
)

func (r *redisOpt) Publish(ctx context.Context, channel string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return r.client.Publish(ctx, channel, payload).Err()
}

func (r *redisOpt) Subscribe(ctx context.Context, channel string) (<-chan string, error) {
	pubsub := r.client.Subscribe(ctx, channel)

	out := make(chan string)

	go func() {
		defer pubsub.Close()
		ch := pubsub.Channel()
		for msg := range ch {
			out <- msg.Payload
		}
	}()

	return out, nil
}
