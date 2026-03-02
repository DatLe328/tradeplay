package cronc

import (
	"fmt"
	"time"
	"tradeplay/common"
	"tradeplay/components/gormc"
	auditEntity "tradeplay/services/audit/entity"
	orderEntity "tradeplay/services/order/entity"

	sctx "tradeplay/pkg/service-context"

	"tradeplay/components/logger"

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

	dbComp := sc.MustGet(common.KeyCompMySQL).(gormc.DBComponent)
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

	_, err = c.scheduler.AddFunc("@every 1h", func() {
		c.cleanOldAuditLogsJob()
	})
	if err != nil {
		return fmt.Errorf("failed to register cleanOldAuditLogsJob: %v", err)
	}

	return nil
}

func (c *cronComponent) cancelExpiredOrdersJob() {
	c.logger.Info("Starting job: Clean expired pending orders...")

	threshold := time.Now().Add(-5 * time.Minute)

	result := c.db.Model(&orderEntity.Order{}).
		Where("status = ? AND type = ? AND created_at < ?",
			orderEntity.OrderStatusPending, orderEntity.OrderTypeDeposit, threshold).
		Update("status", orderEntity.OrderStatusCancelled)

	if result.Error != nil {
		c.logger.Errorf("Job failed: %v", result.Error)
	} else {
		if result.RowsAffected > 0 {
			c.logger.Infof("Job finished: Cancelled %d expired orders", result.RowsAffected)
		}
	}
}

func (c *cronComponent) cleanOldAuditLogsJob() {
	c.logger.Info("Starting job: Clean old audit logs (>30 days)...")

	threshold := time.Now().AddDate(0, 0, -30)

	result := c.db.Table(auditEntity.AuditLog{}.TableName()).
		Where("created_at < ?", threshold).
		Delete(nil)

	if result.Error != nil {
		c.logger.Errorf("Clean logs job failed: %v", result.Error)
	} else {
		if result.RowsAffected > 0 {
			c.logger.Infof("Clean logs job finished: Deleted %d old audit logs", result.RowsAffected)
		} else {
			c.logger.Info("Clean logs job finished: No old logs to delete")
		}
	}
}
