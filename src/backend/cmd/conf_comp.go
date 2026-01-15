package cmd

import (
	"flag"
	"tradeplay/common"

	sctx "github.com/DatLe328/service-context"
)

type config struct {
	s3Prefix string
}

func NewConfig() *config {
	return &config{}
}

func (*config) ID() string {
	return common.KeyComConf
}

func (c *config) InitFlags() {
	flag.StringVar(
		&c.s3Prefix,
		"s3-prefix",
		"",
		"S3 prefix for uploaded account files",
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
