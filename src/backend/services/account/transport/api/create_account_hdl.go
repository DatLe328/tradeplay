package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) CreateAccountHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var data entity.Account

		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(core.KeyRequester).(core.Requester)

		uid, _ := core.FromBase58(requester.GetSubject())
		data.OwnerId = int(uid.GetLocalID())

		data.Status = entity.AccountStatusAvailable

		if err := api.business.CreateAccount(c.Request.Context(), &data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
