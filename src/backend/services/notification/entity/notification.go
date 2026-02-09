package entity

import (
	"database/sql"
	"time"

	"gorm.io/datatypes"
)

// NotificationType enum
type NotificationType int8

const (
	NotificationTypeOrderStatus NotificationType = 0
	NotificationTypeAccountSold NotificationType = 1
	NotificationTypePromotion   NotificationType = 2
	NotificationTypeSystem      NotificationType = 3
	NotificationTypeMessage     NotificationType = 4
)

type Notification struct {
	ID        int32           `gorm:"column:id;primaryKey"`
	UserID    int32           `gorm:"column:user_id;index:idx_notifications_user_unread,priority:1"`
	Type      NotificationType `gorm:"column:type;index:idx_notifications_type"`
	Title     string          `gorm:"column:title"`
	Message   string          `gorm:"column:message"`
	Data      datatypes.JSON  `gorm:"column:data;type:json"`
	ActionURL *string         `gorm:"column:action_url"`
	IsRead    bool            `gorm:"column:is_read;index:idx_notifications_user_unread,priority:2"`
	ReadAt    *time.Time      `gorm:"column:read_at;type:datetime(3)"`
	CreatedAt time.Time       `gorm:"column:created_at;type:datetime(3);index:idx_notifications_user_unread,priority:3"`
	UpdatedAt time.Time       `gorm:"column:updated_at;type:datetime(3)"`
}

func (Notification) TableName() string {
	return "notifications"
}

// DTO for response
type NotificationDTO struct {
	ID        int32           `json:"id"`
	UserID    int32           `json:"user_id"`
	Type      NotificationType `json:"type"`
	Title     string          `json:"title"`
	Message   string          `json:"message"`
	Data      datatypes.JSON  `json:"data,omitempty"`
	ActionURL *string         `json:"action_url,omitempty"`
	IsRead    bool            `json:"is_read"`
	ReadAt    *time.Time      `json:"read_at,omitempty"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

func (n *Notification) ToDTO() *NotificationDTO {
	return &NotificationDTO{
		ID:        n.ID,
		UserID:    n.UserID,
		Type:      n.Type,
		Title:     n.Title,
		Message:   n.Message,
		Data:      n.Data,
		ActionURL: n.ActionURL,
		IsRead:    n.IsRead,
		ReadAt:    n.ReadAt,
		CreatedAt: n.CreatedAt,
		UpdatedAt: n.UpdatedAt,
	}
}

// CreateNotificationRequest for creating notifications
type CreateNotificationRequest struct {
	UserID    int32          `json:"user_id" binding:"required"`
	Type      NotificationType `json:"type" binding:"required"`
	Title     string         `json:"title" binding:"required"`
	Message   string         `json:"message" binding:"required"`
	Data      datatypes.JSON `json:"data,omitempty"`
	ActionURL *string        `json:"action_url,omitempty"`
}

// MarkAsReadRequest for marking notification as read
type MarkAsReadRequest struct {
	ReadAt *sql.NullTime `json:"read_at,omitempty"`
}
