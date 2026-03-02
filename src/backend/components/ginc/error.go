package ginc

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type appError interface {
	error
	StatusCode() int
}

// WriteErrorResponse maps an error to the appropriate HTTP status and writes a JSON response.
func WriteErrorResponse(c *gin.Context, err error) {
	statusCode := http.StatusInternalServerError
	var message string

	if e, ok := err.(appError); ok {
		statusCode = e.StatusCode()
		message = e.Error()
	} else {
		message = err.Error()
	}

	if statusCode == http.StatusInternalServerError {
		log.Printf("[INTERNAL ERROR] %v\n", err)
	}

	c.JSON(statusCode, gin.H{
		"code":    statusCode,
		"message": message,
	})
}
