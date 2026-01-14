package api

import (
	"context"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

type Business interface {
	CreateAccount(ctx context.Context, data *entity.Account) error
	ListAccount(ctx context.Context, filter *entity.Filter, paging *core.Paging) ([]entity.Account, error)
	UpdateAccount(ctx context.Context, id int, data *entity.AccountDataPatch) error
	DeleteAccount(ctx context.Context, id int) error
	GetAccount(ctx context.Context, id int) (*entity.Account, error)
}

type api struct {
	business Business
}

func NewAccountAPI(business Business) *api {
	return &api{
		business: business,
	}
}
