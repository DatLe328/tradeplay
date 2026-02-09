package notification

import (
	"context"

	"gorm.io/datatypes"

	"tradeplay/services/notification/entity"
	"tradeplay/services/notification/repository"
)

// Helper function để tạo notification một cách đơn giản
func CreateNotification(
	ctx context.Context,
	repo repository.NotificationRepository,
	userID int32,
	notificationType entity.NotificationType,
	title string,
	message string,
	data datatypes.JSON,
	actionURL *string,
) (*entity.Notification, error) {
	notification := &entity.Notification{
		UserID:    userID,
		Type:      notificationType,
		Title:     title,
		Message:   message,
		Data:      data,
		ActionURL: actionURL,
		IsRead:    false,
	}

	return repo.CreateNotification(ctx, notification)
}
