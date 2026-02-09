package mysql

import (
	"context"
	"time"

	"gorm.io/gorm"

	"tradeplay/services/notification/entity"
)

type notificationWriter struct {
	db *gorm.DB
}

func NewNotificationWriter(db *gorm.DB) *notificationWriter {
	return &notificationWriter{db: db}
}

func (writer *notificationWriter) CreateNotification(ctx context.Context, notification *entity.Notification) (*entity.Notification, error) {
	if err := writer.db.WithContext(ctx).Create(notification).Error; err != nil {
		return nil, err
	}
	return notification, nil
}

func (writer *notificationWriter) MarkAsRead(ctx context.Context, id int32) error {
	now := time.Now()
	return writer.db.WithContext(ctx).
		Model(&entity.Notification{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error
}

func (writer *notificationWriter) MarkAllAsRead(ctx context.Context, userID int32) error {
	now := time.Now()
	return writer.db.WithContext(ctx).
		Model(&entity.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error
}

func (writer *notificationWriter) DeleteNotification(ctx context.Context, id int32) error {
	return writer.db.WithContext(ctx).
		Delete(&entity.Notification{}, id).Error
}
