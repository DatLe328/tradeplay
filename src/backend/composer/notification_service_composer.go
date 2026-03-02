package composer

import (
	"context"

	"github.com/gin-gonic/gin"

	"tradeplay/common"
	notificationBiz "tradeplay/services/notification/business"
	"tradeplay/services/notification/entity"
	notificationRepository "tradeplay/services/notification/repository"
	notificationMysql "tradeplay/services/notification/repository/mysql"
	notificationApi "tradeplay/services/notification/transport/api"

	"tradeplay/components/gormc"
	sctx "tradeplay/pkg/service-context"
)

type NotificationService interface {
	ListNotificationsHandler() gin.HandlerFunc
	GetNotificationHandler() gin.HandlerFunc
	MarkAsReadHandler() gin.HandlerFunc
	GetUnreadCountHandler() gin.HandlerFunc
	MarkAllAsReadHandler() gin.HandlerFunc
	DeleteNotificationHandler() gin.HandlerFunc
}

func ComposeNotificationService(serviceCtx sctx.ServiceContext) NotificationService {
db := serviceCtx.MustGet(common.KeyCompMySQL).(gormc.DBComponent).GetDB()

	reader := notificationMysql.NewNotificationReader(db)
	writer := notificationMysql.NewNotificationWriter(db)

	notificationRepo := &compositeNotificationRepository{reader: reader, writer: writer}

	notificationBusiness := notificationBiz.NewBusiness(notificationRepo)

	notificationAPI := notificationApi.NewAPI(notificationBusiness)

	return &notificationServiceImpl{
		api: notificationAPI,
	}
}

type notificationServiceImpl struct {
	api notificationApi.API
}

func (svc *notificationServiceImpl) ListNotificationsHandler() gin.HandlerFunc {
	return svc.api.ListNotificationsHandler()
}

func (svc *notificationServiceImpl) GetNotificationHandler() gin.HandlerFunc {
	return svc.api.GetNotificationHandler()
}

func (svc *notificationServiceImpl) MarkAsReadHandler() gin.HandlerFunc {
	return svc.api.MarkAsReadHandler()
}

func (svc *notificationServiceImpl) MarkAllAsReadHandler() gin.HandlerFunc {
	return svc.api.MarkAllAsReadHandler()
}

func (svc *notificationServiceImpl) GetUnreadCountHandler() gin.HandlerFunc {
	return svc.api.GetUnreadCountHandler()
}

func (svc *notificationServiceImpl) DeleteNotificationHandler() gin.HandlerFunc {
	return svc.api.DeleteNotificationHandler()
}

// Composite repository implementation
type compositeNotificationRepository struct {
	reader notificationRepository.NotificationReader
	writer notificationRepository.NotificationWriter
}

func (r *compositeNotificationRepository) GetNotificationByID(ctx context.Context, id int32) (*entity.Notification, error) {
	return r.reader.GetNotificationByID(ctx, id)
}

func (r *compositeNotificationRepository) ListNotifications(ctx context.Context, userID int32, limit int, offset int) ([]*entity.Notification, error) {
	return r.reader.ListNotifications(ctx, userID, limit, offset)
}

func (r *compositeNotificationRepository) GetUnreadCount(ctx context.Context, userID int32) (int32, error) {
	return r.reader.GetUnreadCount(ctx, userID)
}

func (r *compositeNotificationRepository) CreateNotification(ctx context.Context, notification *entity.Notification) (*entity.Notification, error) {
	return r.writer.CreateNotification(ctx, notification)
}

func (r *compositeNotificationRepository) MarkAsRead(ctx context.Context, id int32) error {
	return r.writer.MarkAsRead(ctx, id)
}

func (r *compositeNotificationRepository) MarkAllAsRead(ctx context.Context, userID int32) error {
	return r.writer.MarkAllAsRead(ctx, userID)
}

func (r *compositeNotificationRepository) DeleteNotification(ctx context.Context, id int32) error {
	return r.writer.DeleteNotification(ctx, id)
}
