package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
)

func (api *api) VerifyEmailHandler() func(*gin.Context) {
	return func(c *gin.Context) {
		var data entity.VerifyEmailData

		// 1. Parse dữ liệu từ Body JSON
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}

		// 2. Gọi Business
		if err := api.business.VerifyEmail(c.Request.Context(), &data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		// 3. Trả về thành công
		c.JSON(http.StatusOK, core.ResponseData(true))
	}
}
