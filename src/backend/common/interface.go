package common

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type GinEngine interface {
	GetPort() int
	GetRouter() *gin.Engine
	Run()
}

type JWTProvider interface {
	IssueToken(ctx context.Context, id, sub string, seconds int) (token string, expSecs int, err error)
	ParseToken(ctx context.Context, tokenString string) (claims *jwt.RegisteredClaims, err error)
}

type EmailComponent interface {
	SendEmail(to []string, subject string, content string) error
}

type GormComponent interface {
	GetDB() *gorm.DB
}

type Publisher interface {
	Publish(ctx context.Context, topic string, data interface{}) error
}

type PresignedURLResponse struct {
	UploadURL string `json:"upload_url"`
	FileURL   string `json:"file_url"`
	Key       string `json:"key"`
}

type UploadComponent interface {
	UploadFile(ctx context.Context, data []byte, dst string) (*Image, error)
	DeleteFiles(ctx context.Context, urls []string) error
	GeneratePresignedURL(ctx context.Context, key, contentType string, expiration time.Duration, maxSize int64) (*PresignedURLResponse, error)
}

type ConfigComponent interface {
	S3Prefix() string
	SepayAPIKey() string
	UnderMaintenance() bool
	AppSecretKey() string
}

type RedisComponent interface {
	GetClient() *redis.Client
	Produce(ctx context.Context, stream string, data map[string]interface{}) error
	Consume(ctx context.Context, stream, group, consumer string, handler func(map[string]interface{}) error)
}
