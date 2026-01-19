package middleware

import (
	"tradeplay/common"
	userEntity "tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func IdentifyAdmin(userStore UserStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		requester, exists := c.Get(core.KeyRequester)
		if !exists {
			c.Next()
			return
		}

		req := requester.(core.Requester)
		uid, _ := core.FromBase58(req.GetSubject())

		user, err := userStore.GetUserByID(c.Request.Context(), int(uid.GetLocalID()))

		if err == nil && user.SystemRole == userEntity.RoleAdmin {
			c.Set(string(common.KeyIsAdmin), true)
		}

		c.Next()
	}
}
