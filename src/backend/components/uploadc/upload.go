package uploadc

import (
	"context"
	"flag"
	"fmt"
	"time"
	"tradeplay/common"

	sctx "github.com/DatLe328/service-context"
)

const (
	ProviderS3 = "s3"
)

type UploadProvider interface {
	UploadFile(ctx context.Context, data []byte, dst string) (*common.Image, error)
	DeleteFile(ctx context.Context, url string) error
	GeneratePresignedURL(ctx context.Context, key, contentType string, expiration time.Duration, maxSize int64) (*common.PresignedURLResponse, error)
}

type uploadComponent struct {
	id       string
	provider UploadProvider

	providerType string

	s3Bucket    string
	s3Region    string
	s3Endpoint  string
	s3Domain    string
	s3AccessKey string
	s3SecretKey string
}

func NewUploadComponent(id string) *uploadComponent {
	return &uploadComponent{
		id: id,
	}
}

func (c *uploadComponent) ID() string {
	return c.id
}

func (c *uploadComponent) InitFlags() {
	flag.StringVar(&c.providerType, "upload-provider-type", ProviderS3, "Provider type: s3")

	flag.StringVar(&c.s3Bucket, "s3-bucket", "", "AWS S3 Bucket Name")
	flag.StringVar(&c.s3Region, "s3-region", "auto", "AWS S3 Region (use 'auto' for R2)")
	flag.StringVar(&c.s3Endpoint, "s3-endpoint", "", "S3 Custom Endpoint (Required for R2)")
	flag.StringVar(&c.s3Domain, "s3-domain", "", "AWS S3 Domain (Public URL for viewing files)")
	flag.StringVar(&c.s3AccessKey, "aws-access-key-id", "", "AWS Access Key ID")
	flag.StringVar(&c.s3SecretKey, "aws-secret-access-key", "", "AWS Secret Access Key")
}

func (c *uploadComponent) Activate(s sctx.ServiceContext) error {
	s.Logger(c.id).Infof("Activating upload component with provider: %s", c.providerType)

	if c.s3Bucket == "" {
		return fmt.Errorf("s3-bucket is required")
	}
	if c.s3Domain == "" {
		return fmt.Errorf("s3-domain is required")
	}
	if c.s3AccessKey == "" || c.s3SecretKey == "" {
		return fmt.Errorf("AWS credentials are required")
	}

	switch c.providerType {
	case ProviderS3:
		provider, err := NewS3Provider(c.s3Bucket, c.s3Region, c.s3Endpoint, c.s3Domain, c.s3AccessKey, c.s3SecretKey)
		if err != nil {
			return fmt.Errorf("failed to initialize S3 provider: %w", err)
		}
		c.provider = provider
		s.Logger(c.id).Infof("S3 provider initialized. Bucket: %s, Region: %s, Endpoint: %s", c.s3Bucket, c.s3Region, c.s3Endpoint)
	default:
		return fmt.Errorf("unknown upload provider type: %s", c.providerType)
	}

	return nil
}

func (c *uploadComponent) Stop() error {
	return nil
}

func (c *uploadComponent) UploadFile(ctx context.Context, data []byte, dst string) (*common.Image, error) {
	if c.provider == nil {
		return nil, fmt.Errorf("upload provider is not initialized")
	}
	return c.provider.UploadFile(ctx, data, dst)
}

func (c *uploadComponent) DeleteFile(ctx context.Context, url string) error {
	if c.provider == nil {
		return fmt.Errorf("upload provider is not initialized")
	}
	return c.provider.DeleteFile(ctx, url)
}

func (c *uploadComponent) DeleteFiles(ctx context.Context, urls []string) error {
	if c.provider == nil {
		return fmt.Errorf("upload provider is not initialized")
	}

	for _, url := range urls {
		if err := c.provider.DeleteFile(ctx, url); err != nil {
			fmt.Printf("Warning: failed to delete file %s: %v\n", url, err)
		}
	}

	return nil
}

func (c *uploadComponent) GeneratePresignedURL(ctx context.Context, key, contentType string, expiration time.Duration, size int64) (*common.PresignedURLResponse, error) {
	if c.provider == nil {
		return nil, fmt.Errorf("upload provider is not initialized")
	}
	return c.provider.GeneratePresignedURL(ctx, key, contentType, expiration, size)
}
