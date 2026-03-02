package api

import (
	"tradeplay/common"
	sctx "tradeplay/pkg/service-context"
)

type api struct {
	serviceCtx sctx.ServiceContext
	uploadComp common.FileStorage
}

func NewUploadAPI(serviceCtx sctx.ServiceContext) *api {
	uploadComp := serviceCtx.MustGet(common.KeyCompUpload).(common.FileStorage)
	return &api{serviceCtx: serviceCtx, uploadComp: uploadComp}
}
