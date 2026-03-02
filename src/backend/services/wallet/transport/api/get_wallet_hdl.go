package api

import (
	"net/http"
	"tradeplay/common"
	ginc "tradeplay/components/ginc"

	"github.com/gin-gonic/gin"
)

func (api *api) GetMeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(common.KeyRequester).(common.Requester)

		uid, err := common.FromBase58(requester.GetSubject())

		if err != nil {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		userId := int32(uid.GetLocalID())

		wallet, err := api.business.GetUserWallet(c.Request.Context(), userId)
		if err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(wallet))
	}
}
