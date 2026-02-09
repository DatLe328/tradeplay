package business

import (
	"context"

	"tradeplay/services/notification/entity"
	"tradeplay/services/notification/repository"
)

type Business interface {
	CreateNotification(ctx context.Context, notification *entity.Notification) (*entity.NotificationDTO, error)
	ListNotifications(ctx context.Context, userID int32, limit int, offset int) ([]*entity.NotificationDTO, int32, error)
	GetNotification(ctx context.Context, id int32, userID int32) (*entity.NotificationDTO, error)
	MarkAsRead(ctx context.Context, id int32, userID int32) error
	MarkAllAsRead(ctx context.Context, userID int32) error
	GetUnreadCount(ctx context.Context, userID int32) (int32, error)
	DeleteNotification(ctx context.Context, id int32, userID int32) error
}

type business struct {
	repo repository.NotificationRepository
}

func NewBusiness(repo repository.NotificationRepository) Business {
	return &business{repo: repo}
}
