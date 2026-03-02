package api

import (
	"log"
	"net/http"
	ginc "tradeplay/components/ginc"
	"tradeplay/middleware"
	"tradeplay/services/auth/entity"

	"github.com/gin-gonic/gin"
)

func (api *api) LoginHdl() gin.HandlerFunc {
	return func(c *gin.Context) {
		var data entity.AuthEmailPasswordDTO

		if err := c.ShouldBind(&data); err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		userAgent := c.Request.UserAgent()
		clientIP := c.ClientIP()

		response, err := api.business.Authenticate(c.Request.Context(), &data, userAgent, clientIP)
		if err != nil {
			ginc.WriteErrorResponse(c, err)
			return
		}

		origin := c.GetHeader("Origin")
		cookieDomain := ginc.GetCookieDomainForOrigin(origin)
		log.Println("Cookie domain for login", cookieDomain)

		c.SetSameSite(http.SameSiteNoneMode)

		c.SetCookie(
			"accessToken",
			response.AccessToken.Token,
			response.AccessToken.ExpiredIn,
			"/",
			cookieDomain,
			true,
			true,
		)

		if response.RefreshToken != nil {
			c.SetCookie(
				"refreshToken",
				response.RefreshToken.Token,
				response.RefreshToken.ExpiredIn,
				"/",
				cookieDomain,
				true,
				true,
			)
		}

		csrfToken, err := middleware.SetCSRFToken(c)
		if err != nil {
			csrfToken = ""
		}

		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"data": gin.H{
				"message":    "login successful",
				"csrf_token": csrfToken,
			},
		})
	}
}
