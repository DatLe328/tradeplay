package api

import (
	"tradeplay/common"

	sctx "github.com/DatLe328/service-context"
)

type api struct {
	serviceCtx sctx.ServiceContext
	uploadComp common.UploadComponent
}

func NewUploadAPI(serviceCtx sctx.ServiceContext) *api {
	uploadComp := serviceCtx.MustGet(common.KeyCompUpload).(common.UploadComponent)
	return &api{serviceCtx: serviceCtx, uploadComp: uploadComp}
}
