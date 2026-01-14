package middleware

import (
	"errors"
	"net/http"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func RequireAdmin(userStore UserStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(core.KeyRequester).(core.Requester)
		uid, _ := core.FromBase58(requester.GetSubject())

		user, err := userStore.GetUserByID(c.Request.Context(), int(uid.GetLocalID()))

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, core.ErrUnauthorized(err, "User not found", "unauthorized"))
			return
		}

		if user.SystemRole != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, core.ErrForbidden(errors.New("admin access required"), "Bạn không có quyền truy cập trang này"))
			return
		}

		c.Next()
	}
}
