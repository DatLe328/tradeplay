package api

import (
	"net/http"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) GetStatsHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		stats, err := api.business.GetSystemStats(c.Request.Context())
		if err != nil {
			common.WriteErrorResponse(c, err)
			return
		}
		c.JSON(http.StatusOK, core.ResponseData(stats))
	}
}
