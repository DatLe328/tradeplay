package api

import (
	"net/http"
	"tradeplay/common"
	ginc "tradeplay/components/ginc"
	"tradeplay/services/audit/entity"

	"github.com/gin-gonic/gin"
)

func (h *api) ListAuditLogsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var filter entity.AuditLogFilter
		var paging entity.Paging

		if err := c.ShouldBindQuery(&filter); err != nil {
			ginc.WriteErrorResponse(c, common.ErrBadRequest(err, "Invalid filter param"))
			return
		}

		if err := c.ShouldBindQuery(&paging); err != nil {
			ginc.WriteErrorResponse(c, common.ErrBadRequest(err, "Invalid paging param"))
			return
		}

		logs, err := h.business.GetAuditLogs(c.Request.Context(), &filter, &paging)
		if err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.SuccessResponse(logs, paging, filter))
	}
}
