package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"tradeplay/common"
	"tradeplay/services/notification/entity"
)

// ListNotificationsHandler - GET /v1/notifications
func (api *api) ListNotificationsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		limit := 20
		offset := 0

		if l := c.DefaultQuery("limit", "20"); l != "" {
			if val, err := strconv.Atoi(l); err == nil && val > 0 && val <= 100 {
				limit = val
			}
		}

		if o := c.DefaultQuery("offset", "0"); o != "" {
			if val, err := strconv.Atoi(o); err == nil && val >= 0 {
				offset = val
			}
		}

		data, total, err := api.business.ListNotifications(c.Request.Context(), userID, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(gin.H{
			"items": data,
			"total": total,
			"limit": limit,
		}))
	}
}

// GetNotificationHandler - GET /v1/notifications/:id
func (api *api) GetNotificationHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil || id <= 0 {
			c.JSON(http.StatusBadRequest, common.ErrBadRequest(nil, "invalid notification id"))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		data, err := api.business.GetNotification(c.Request.Context(), int32(id), userID)
		if err != nil {
			if err.Error() == "not found" {
				c.JSON(http.StatusNotFound, common.ErrNotFound(entity.Notification{}.TableName()))
				return
			}
			if err.Error() == "forbidden" {
				c.JSON(http.StatusForbidden, common.ErrForbidden(nil, "you don't have permission"))
				return
			}
			c.JSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(data))
	}
}

// MarkAsReadHandler - PATCH /v1/notifications/:id/read
func (api *api) MarkAsReadHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil || id <= 0 {
			c.JSON(http.StatusBadRequest, common.ErrBadRequest(nil, "invalid notification id"))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		err = api.business.MarkAsRead(c.Request.Context(), int32(id), userID)
		if err != nil {
			if err.Error() == "not found" {
				c.JSON(http.StatusNotFound, common.ErrNotFound(entity.Notification{}.TableName()))
				return
			}
			if err.Error() == "forbidden" {
				c.JSON(http.StatusForbidden, common.ErrForbidden(nil, "you don't have permission"))
				return
			}
			c.JSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}

// MarkAllAsReadHandler - POST /v1/notifications/read-all
func (api *api) MarkAllAsReadHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		err := api.business.MarkAllAsRead(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}

// GetUnreadCountHandler - GET /v1/notifications/unread/count
func (api *api) GetUnreadCountHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		count, err := api.business.GetUnreadCount(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(gin.H{"unread_count": count}))
	}
}

// DeleteNotificationHandler - DELETE /v1/notifications/:id
func (api *api) DeleteNotificationHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil || id <= 0 {
			c.JSON(http.StatusBadRequest, common.ErrBadRequest(nil, "invalid notification id"))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		err = api.business.DeleteNotification(c.Request.Context(), int32(id), userID)
		if err != nil {
			if err.Error() == "not found" {
				c.JSON(http.StatusNotFound, common.ErrNotFound(entity.Notification{}.TableName()))
				return
			}
			if err.Error() == "forbidden" {
				c.JSON(http.StatusForbidden, common.ErrForbidden(nil, "you don't have permission"))
				return
			}
			c.JSON(http.StatusInternalServerError, common.ErrInternal(err))
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}
