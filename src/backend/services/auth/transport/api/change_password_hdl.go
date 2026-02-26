package api

import (
	"net/http"
	"tradeplay/common"
	"tradeplay/services/auth/entity"

	"github.com/gin-gonic/gin"
)

// GetUserProfileHandler
// @Summary      Lấy thông tin cá nhân
// @Description  Trả về thông tin chi tiết của user đang đăng nhập
// @Tags         user
// @Accept       json
// @Produce      json
// @Router       /v1/user/me [get]
func (api *api) ChangePasswordHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var data entity.ChangePasswordDTO
		if err := c.ShouldBindJSON(&data); err != nil {
			common.WriteErrorResponse(c, common.ErrInvalidRequest(err))
			return
		}

		requester := c.MustGet(common.KeyRequester).(common.Requester)

		uid, _ := common.FromBase58(requester.GetSubject())
		userID := int32(uid.GetLocalID())

		if err := api.business.ChangePassword(c.Request.Context(), userID, &data); err != nil {
			common.WriteErrorResponse(c, err)
			return
		}

		c.JSON(http.StatusOK, common.ResponseData(true))
	}
}
