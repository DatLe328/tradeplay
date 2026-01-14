package composer

import (
	"tradeplay/services/upload/transport/api"

	sctx "github.com/DatLe328/service-context"
	"github.com/gin-gonic/gin"
)

type UploadService interface {
	GeneratePresignedURLHandler() gin.HandlerFunc
}

func ComposeUploadAPIService(serviceCtx sctx.ServiceContext) UploadService {
	return api.NewUploadAPI(serviceCtx)
}
