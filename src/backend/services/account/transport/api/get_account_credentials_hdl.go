package api

import (
	"net/http"
	"strconv"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) GetAccountCredentialsHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(core.KeyRequester).(core.Requester)
		uid, _ := core.FromBase58(requester.GetSubject())
		requesterId := int(uid.GetLocalID())

		data, err := api.business.GetAccountCredentials(c.Request.Context(), requesterId, id)
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(data))
	}
}
