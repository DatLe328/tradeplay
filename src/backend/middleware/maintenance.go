package middleware

import (
	"net/http"
	"slices"
	"tradeplay/common"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

func MaintenanceSensitiveOnly(serviceCtx sctx.ServiceContext) gin.HandlerFunc {
	conf := serviceCtx.MustGet(common.KeyCompConf).(common.ConfigComponent)

	return func(c *gin.Context) {
		if !conf.UnderMaintenance() {
			c.Next()
			return
		}

		path := c.FullPath()
		method := c.Request.Method

		sensitive := map[string][]string{
			"/v1/orders":        {http.MethodPost, http.MethodPut},
			"/v1/webhook/sepay": {http.MethodPost},
		}

		if blockedMethods, exists := sensitive[path]; exists {
			if slices.Contains(blockedMethods, method) {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"code":    "MAINTENANCE",
					"message": "Hệ thống đang bảo trì chức năng này, vui lòng quay lại sau",
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
