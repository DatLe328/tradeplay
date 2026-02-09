package business

import (
	"context"

	"tradeplay/common"
	"tradeplay/services/notification/entity"
)

func (biz *business) CreateNotification(ctx context.Context, notification *entity.Notification) (*entity.NotificationDTO, error) {
	if notification == nil {
		return nil, common.ErrBadRequest(nil, "notification cannot be nil")
	}

	created, err := biz.repo.CreateNotification(ctx, notification)
	if err != nil {
		return nil, err
	}

	return created.ToDTO(), nil
}

func (biz *business) ListNotifications(ctx context.Context, userID int32, limit int, offset int) ([]*entity.NotificationDTO, int32, error) {
	if userID <= 0 {
		return nil, 0, common.ErrBadRequest(nil, "user_id must be positive")
	}

	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	notifications, err := biz.repo.ListNotifications(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*entity.NotificationDTO, 0)
	for _, n := range notifications {
		dtos = append(dtos, n.ToDTO())
	}

	return dtos, int32(len(dtos)), nil
}

func (biz *business) GetNotification(ctx context.Context, id int32, userID int32) (*entity.NotificationDTO, error) {
	if id <= 0 {
		return nil, common.ErrBadRequest(nil, "notification id must be positive")
	}

	notification, err := biz.repo.GetNotificationByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if notification == nil {
		return nil, common.ErrNotFound(entity.Notification{}.TableName())
	}

	// Verify ownership
	if notification.UserID != userID {
		return nil, common.ErrForbidden(nil, "you don't have permission to access this notification")
	}

	return notification.ToDTO(), nil
}

func (biz *business) MarkAsRead(ctx context.Context, id int32, userID int32) error {
	if id <= 0 {
		return common.ErrBadRequest(nil, "notification id must be positive")
	}

	notification, err := biz.repo.GetNotificationByID(ctx, id)
	if err != nil {
		return err
	}

	if notification == nil {
		return common.ErrNotFound(entity.Notification{}.TableName())
	}

	// Verify ownership
	if notification.UserID != userID {
		return common.ErrForbidden(nil, "you don't have permission to update this notification")
	}

	return biz.repo.MarkAsRead(ctx, id)
}

func (biz *business) MarkAllAsRead(ctx context.Context, userID int32) error {
	if userID <= 0 {
		return common.ErrBadRequest(nil, "user_id must be positive")
	}

	return biz.repo.MarkAllAsRead(ctx, userID)
}

func (biz *business) GetUnreadCount(ctx context.Context, userID int32) (int32, error) {
	if userID <= 0 {
		return 0, common.ErrBadRequest(nil, "user_id must be positive")
	}

	return biz.repo.GetUnreadCount(ctx, userID)
}

func (biz *business) DeleteNotification(ctx context.Context, id int32, userID int32) error {
	if id <= 0 {
		return common.ErrBadRequest(nil, "notification id must be positive")
	}

	notification, err := biz.repo.GetNotificationByID(ctx, id)
	if err != nil {
		return err
	}

	if notification == nil {
		return common.ErrNotFound(entity.Notification{}.TableName())
	}

	// Verify ownership
	if notification.UserID != userID {
		return common.ErrForbidden(nil, "you don't have permission to delete this notification")
	}

	return biz.repo.DeleteNotification(ctx, id)
}
