package common

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type AppError interface {
	error
	StatusCode() int
}

func WriteErrorResponse(c *gin.Context, err error) {
	statusCode := http.StatusInternalServerError
	if e, ok := err.(AppError); ok {
		statusCode = e.StatusCode()
	}
	c.JSON(statusCode, err)
}
