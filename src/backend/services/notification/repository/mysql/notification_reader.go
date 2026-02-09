package mysql

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"tradeplay/services/notification/entity"
)

type notificationReader struct {
	db *gorm.DB
}

func NewNotificationReader(db *gorm.DB) *notificationReader {
	return &notificationReader{db: db}
}

func (reader *notificationReader) GetNotificationByID(ctx context.Context, id int32) (*entity.Notification, error) {
	var notification entity.Notification
	if err := reader.db.WithContext(ctx).Where("id = ?", id).First(&notification).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &notification, nil
}

func (reader *notificationReader) ListNotifications(ctx context.Context, userID int32, limit int, offset int) ([]*entity.Notification, error) {
	var notifications []*entity.Notification
	if err := reader.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

func (reader *notificationReader) GetUnreadCount(ctx context.Context, userID int32) (int32, error) {
	var count int64
	if err := reader.db.WithContext(ctx).
		Where("user_id = ? AND is_read = ?", userID, false).
		Model(&entity.Notification{}).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int32(count), nil
}
