package repository

import (
	"context"

	"tradeplay/services/notification/entity"
)

type NotificationReader interface {
	GetNotificationByID(ctx context.Context, id int32) (*entity.Notification, error)
	ListNotifications(ctx context.Context, userID int32, limit int, offset int) ([]*entity.Notification, error)
	GetUnreadCount(ctx context.Context, userID int32) (int32, error)
}

type NotificationWriter interface {
	CreateNotification(ctx context.Context, notification *entity.Notification) (*entity.Notification, error)
	MarkAsRead(ctx context.Context, id int32) error
	MarkAllAsRead(ctx context.Context, userID int32) error
	DeleteNotification(ctx context.Context, id int32) error
}

type NotificationRepository interface {
	NotificationReader
	NotificationWriter
}
