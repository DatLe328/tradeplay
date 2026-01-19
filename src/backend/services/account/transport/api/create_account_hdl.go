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
		var data entity.AccountDataCreation

		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(core.KeyRequester).(core.Requester)

		uid, _ := core.FromBase58(requester.GetSubject())
		userId := int(uid.GetLocalID())

		newId, err := api.business.CreateAccount(c.Request.Context(), userId, &data)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(newId))
	}
}
