package common

import (
	"context"
	"time"
)

type TokenProvider interface {
	IssueToken(ctx context.Context, id, sub string, seconds int) (token string, expSecs int, err error)
	ParseToken(ctx context.Context, tokenString string) (claims *TokenClaims, err error)
}

type Mailer interface {
	SendEmail(to []string, subject string, content string) error
}

type Publisher interface {
	Publish(ctx context.Context, topic string, data interface{}) error
}

type PresignedURLResponse struct {
	UploadURL string `json:"upload_url"`
	FileURL   string `json:"file_url"`
	Key       string `json:"key"`
}

type FileStorage interface {
	UploadFile(ctx context.Context, data []byte, dst string) (*Image, error)
	DeleteFiles(ctx context.Context, urls []string) error
	GeneratePresignedURL(ctx context.Context, key, contentType string, expiration time.Duration, maxSize int64) (*PresignedURLResponse, error)
}

type AppConfig interface {
	S3Prefix() string
	SepayAPIKey() string
	UnderMaintenance() bool
	AppSecretKey() string
}

type KeyValueStore interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Del(ctx context.Context, key string) error
	IncrWithExpire(ctx context.Context, key string, expiration time.Duration) (int64, error)
}

type StreamBroker interface {
	Produce(ctx context.Context, stream string, data map[string]interface{}) error
	Consume(ctx context.Context, stream, group, consumer string, handler func(map[string]interface{}) error)
}
