package cronc

import (
	"fmt"
	"time"
	"tradeplay/common"
	"tradeplay/services/order/entity"

	sctx "github.com/DatLe328/service-context"
	"github.com/DatLe328/service-context/logger"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

type cronComponent struct {
	scheduler *cron.Cron
	logger    logger.Logger
	db        *gorm.DB
}

func NewCronComponent() *cronComponent {
	return &cronComponent{}
}

func (c *cronComponent) ID() string {
	return common.KeyCompCron
}

func (c *cronComponent) InitFlags() {
}

func (c *cronComponent) Activate(sc sctx.ServiceContext) error {
	c.logger = sc.Logger("cron-component")

	dbComp := sc.MustGet(common.KeyCompMySQL).(common.GormComponent)
	c.db = dbComp.GetDB()

	c.scheduler = cron.New(cron.WithSeconds())

	if err := c.registerJobs(); err != nil {
		return err
	}

	c.scheduler.Start()
	c.logger.Info("Cron component started successfully")

	return nil
}

func (c *cronComponent) Stop() error {
	if c.scheduler != nil {
		ctx := c.scheduler.Stop()
		<-ctx.Done()
	}
	c.logger.Info("Cron component stopped")
	return nil
}

func (c *cronComponent) registerJobs() error {
	_, err := c.scheduler.AddFunc("@every 10m", func() {
		c.cancelExpiredOrdersJob()
	})

	if err != nil {
		return fmt.Errorf("failed to register cancelExpiredOrdersJob: %v", err)
	}

	return nil
}

func (c *cronComponent) cancelExpiredOrdersJob() {
	c.logger.Info("Starting job: Clean expired pending orders...")

	threshold := time.Now().Add(-30 * time.Minute)

	result := c.db.Model(&entity.Order{}).
		Where("status = ? AND type = ? AND created_at < ?",
			entity.OrderStatusPending, entity.OrderTypeDeposit, threshold).
		Update("status", entity.OrderStatusCancelled)

	if result.Error != nil {
		c.logger.Errorf("Job failed: %v", result.Error)
	} else {
		if result.RowsAffected > 0 {
			c.logger.Infof("Job finished: Cancelled %d expired orders", result.RowsAffected)
		}
	}
}
