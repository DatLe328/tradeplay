package uploadc

import (
	"bytes"
	"context"
	"fmt"
	"net/url"
	"path/filepath"
	"strings"
	"time"
	"tradeplay/common"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

const (
	maxFileSize = 10 * 1024 * 1024
)

type s3Provider struct {
	bucket        string
	region        string
	domain        string
	client        *s3.Client
	uploader      *manager.Uploader
	presignClient *s3.PresignClient
}

func NewS3Provider(bucket, region, domain, accessKey, secretKey string) (*s3Provider, error) {
	cfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)
	uploader := manager.NewUploader(client)
	presignClient := s3.NewPresignClient(client)

	return &s3Provider{
		bucket:        bucket,
		region:        region,
		domain:        domain,
		client:        client,
		uploader:      uploader,
		presignClient: presignClient,
	}, nil
}

func (p *s3Provider) UploadFile(ctx context.Context, data []byte, dst string) (*common.Image, error) {
	if len(data) > maxFileSize {
		return nil, fmt.Errorf("file size exceeds maximum allowed size of %d bytes", maxFileSize)
	}

	contentType := getContentType(dst)
	if contentType == "application/octet-stream" {
		return nil, fmt.Errorf("unsupported file type: %s", filepath.Ext(dst))
	}

	_, err := p.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(p.bucket),
		Key:         aws.String(dst),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),

		CacheControl: aws.String("public, max-age=2592000"),

		ACL: types.ObjectCannedACLPrivate,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	img := &common.Image{
		Url:       fmt.Sprintf("%s/%s", strings.TrimRight(p.domain, "/"), dst),
		CloudName: "s3",
		Extension: filepath.Ext(dst),
	}

	return img, nil
}

func getContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	default:
		return "application/octet-stream"
	}
}

func (p *s3Provider) DeleteFile(ctx context.Context, fileURL string) error {
	cleanDomain := strings.TrimRight(p.domain, "/")

	if !strings.HasPrefix(fileURL, cleanDomain) {
		return fmt.Errorf("url does not match configured s3 domain")
	}

	objectKey := strings.TrimPrefix(fileURL, cleanDomain)
	objectKey = strings.TrimLeft(objectKey, "/")

	decodedKey, err := url.QueryUnescape(objectKey)
	if err == nil {
		objectKey = decodedKey
	}

	_, err = p.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(p.bucket),
		Key:    aws.String(objectKey),
	})

	if err != nil {
		return fmt.Errorf("failed to delete file from S3: %w", err)
	}

	return nil
}

func (p *s3Provider) GeneratePresignedURL(ctx context.Context, key, contentType string, expiration time.Duration, size int64) (*common.PresignedURLResponse, error) {
	request, err := p.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(p.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(size),
	}, s3.WithPresignExpires(expiration))

	if err != nil {
		return nil, fmt.Errorf("failed to generate presigned url: %w", err)
	}

	fileURL := fmt.Sprintf("%s/%s", strings.TrimRight(p.domain, "/"), key)

	return &common.PresignedURLResponse{
		UploadURL: request.URL,
		FileURL:   fileURL,
		Key:       key,
	}, nil
}
