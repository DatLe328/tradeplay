package api

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"tradeplay/common"

	"github.com/DatLe328/service-context/core"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type presignRequest struct {
	Filename    string `json:"filename" binding:"required"`
	ContentType string `json:"content_type"`
	Size        int64  `json:"size" binding:"required"`
}

func (a *api) GeneratePresignedURLHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req presignRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(err))
			return
		}
		const MAX_UPLOAD_SIZE = 100 * 1024 * 1024
		if req.Size > MAX_UPLOAD_SIZE {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(
				fmt.Errorf("file size %d bytes exceeds limit of %d bytes", req.Size, MAX_UPLOAD_SIZE),
			))
			return
		}

		ext := strings.ToLower(filepath.Ext(req.Filename))
		allowedExts := map[string]bool{
			".jpg": true, ".jpeg": true, ".png": true, ".webp": true,
			".mp4": true, ".mov": true, ".avi": true, ".webm": true,
		}
		if !allowedExts[ext] {
			common.WriteErrorResponse(c, core.ErrInvalidRequest(
				fmt.Errorf("file type %s is not allowed", ext),
			))
			return
		}

		contentType := req.ContentType
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		configComp := a.serviceCtx.MustGet(common.KeyCompConf).(common.ConfigComponent)
		prefix := configComp.S3Prefix()

		key := fmt.Sprintf("%s%s%s", prefix, uuid.New().String(), ext)

		result, err := a.uploadComp.GeneratePresignedURL(c.Request.Context(), key, contentType, 15*time.Minute, req.Size)
		if err != nil {
			common.WriteErrorResponse(c, core.ErrInternal(err))
			return
		}

		c.JSON(http.StatusOK, core.ResponseData(result))
	}
}
