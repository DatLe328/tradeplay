package api

import (
	"github.com/gin-gonic/gin"

	"tradeplay/services/notification/business"
)

type API interface {
	ListNotificationsHandler() gin.HandlerFunc
	GetNotificationHandler() gin.HandlerFunc
	MarkAsReadHandler() gin.HandlerFunc
	MarkAllAsReadHandler() gin.HandlerFunc
	GetUnreadCountHandler() gin.HandlerFunc
	DeleteNotificationHandler() gin.HandlerFunc
}

type api struct {
	business business.Business
}

func NewAPI(business business.Business) API {
	return &api{business: business}
}
