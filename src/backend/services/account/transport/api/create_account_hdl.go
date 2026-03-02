package api

import (
	"net/http"
	"tradeplay/common"
	ginc "tradeplay/components/ginc"
	"tradeplay/services/account/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) CreateAccountHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var data entity.AccountDataCreation

		if err := c.ShouldBindJSON(&data); err != nil {
			ginc.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)

		uid, _ := common.FromBase58(requester.GetSubject())
		userId := int32(uid.GetLocalID())

		newId, err := api.business.CreateAccount(c.Request.Context(), userId, &data)
		if err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(newId))
	}
}
