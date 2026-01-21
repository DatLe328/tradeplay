package cmd

import (
	"flag"
	"tradeplay/common"

	sctx "github.com/DatLe328/service-context"
)

type config struct {
	s3Prefix         string
	sepayApiKey      string
	underMaintenance bool
	appSecretKey     string
}

func NewConfig() *config {
	return &config{}
}

func (*config) ID() string {
	return common.KeyCompConf
}

func (c *config) InitFlags() {
	flag.StringVar(
		&c.s3Prefix,
		"s3-prefix",
		"",
		"S3 prefix for uploaded account files",
	)

	flag.StringVar(
		&c.sepayApiKey,
		"sepay-api-key",
		"",
		"Sepay api key",
	)

	flag.StringVar(
		&c.appSecretKey,
		"app-secret-key",
		"",
		"Application secret key",
	)

	flag.BoolVar(
		&c.underMaintenance,
		"under-maintenance",
		false,
		"Enable maintenance mode",
	)
}

func (c *config) Activate(sctx.ServiceContext) error {
	return nil
}

func (c *config) Stop() error {
	return nil
}

func (c *config) S3Prefix() string {
	return c.s3Prefix
}

func (c *config) SepayAPIKey() string {
	return c.sepayApiKey
}

func (c *config) UnderMaintenance() bool {
	return c.underMaintenance
}

func (c *config) AppSecretKey() string {
	return c.appSecretKey
}
