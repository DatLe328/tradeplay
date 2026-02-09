package api

import (
	"net/http"
	"tradeplay/common"

	"github.com/gin-gonic/gin"
)

func (api *api) GetUserProfileHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(common.KeyRequester).(common.Requester)
		uid, err := common.FromBase58(requester.GetSubject())
		if err != nil {
			common.WriteErrorResponse(c, common.ErrUnauthorized(err, "invalid requester"))
			return
		}
		requesterID := int32(uid.GetLocalID())

		user, err := api.business.GetUserByID(c.Request.Context(), requesterID)

		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		user.Mask()
		c.JSON(http.StatusOK, common.ResponseData(user))
	}
}
