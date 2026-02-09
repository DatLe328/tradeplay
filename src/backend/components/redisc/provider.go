package redisc

import (
	"context"
	"flag"
	"fmt"
	"time"

	sctx "tradeplay/components/service-context"

	"github.com/redis/go-redis/v9"
)

type redisOpt struct {
	id       string
	address  string
	password string
	db       int
	client   *redis.Client
}

func NewRedis(id string) *redisOpt {
	return &redisOpt{id: id}
}

func (r *redisOpt) ID() string { return r.id }

func (r *redisOpt) InitFlags() {
	flag.StringVar(&r.address, "redis-addr", "localhost:6379", "Redis address")
	flag.StringVar(&r.password, "redis-pass", "", "Redis password")
	flag.IntVar(&r.db, "redis-db", 0, "Redis DB")
}

func (r *redisOpt) Activate(s sctx.ServiceContext) error {
	r.client = redis.NewClient(&redis.Options{
		Addr:     r.address,
		Password: r.password,
		DB:       r.db,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := r.client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect redis: %v", err)
	}

	s.Logger(r.id).Infof("Redis connected at %s", r.address)
	return nil
}

func (r *redisOpt) Stop() error {
	if r.client != nil {
		return r.client.Close()
	}
	return nil
}

func (r *redisOpt) GetClient() *redis.Client {
	return r.client
}
