package middleware

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"
	"tradeplay/common"
	userEntity "tradeplay/services/user/entity"

	sctx "tradeplay/components/service-context"

	"github.com/gin-gonic/gin"
)

func RequireAdmin(serviceCtx sctx.ServiceContext, userStore UserStore) gin.HandlerFunc {
	redisComp := serviceCtx.MustGet(common.KeyCompRedis).(common.RedisComponent)
	rdb := redisComp.GetClient()

	return func(c *gin.Context) {
		requester, ok := c.MustGet(common.KeyRequester).(common.Requester)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, common.ErrUnauthorized(nil, "Unauthorized"))
			return
		}

		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		cacheKey := fmt.Sprintf("user:role:%d", userID)
		roleStr, err := rdb.Get(c.Request.Context(), cacheKey).Result()

		if err == nil {
			roleInt, _ := strconv.Atoi(roleStr)
			if userEntity.SystemRole(roleInt) == userEntity.RoleAdmin {
				c.Next()
				return
			}
			c.AbortWithStatusJSON(http.StatusForbidden, common.ErrForbidden(errors.New("not admin"), "Bạn không có quyền truy cập"))
			return
		}

		user, err := userStore.GetUserByID(c.Request.Context(), userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, common.ErrUnauthorized(err, "User not found"))
			return
		}

		go rdb.Set(context.Background(), cacheKey, strconv.Itoa(int(user.SystemRole)), 30*time.Minute)

		if user.SystemRole != userEntity.RoleAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, common.ErrForbidden(errors.New("admin access required"), "Bạn không có quyền truy cập trang này"))
			return
		}

		c.Next()
	}
}
