package api

import (
	"net/http"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) GetMeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.MustGet(core.KeyRequester).(core.Requester)

		uid, err := core.FromBase58(requester.GetSubject())

		if err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		userId := int(uid.GetLocalID())

		wallet, err := api.business.GetUserWallet(c.Request.Context(), userId)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(wallet))
	}
}
