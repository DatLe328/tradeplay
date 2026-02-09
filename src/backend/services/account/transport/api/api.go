package api

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"
)

type Business interface {
	CreateAccount(ctx context.Context, userID int32, data *entity.AccountDataCreation) (*int32, error)
	FindAccounts(ctx context.Context, filter *entity.Filter, paging *common.Paging) ([]entity.Account, error)
	UpdateAccount(ctx context.Context, id int32, data *entity.AccountDataUpdate) error
	DeleteAccount(ctx context.Context, id int32) error
	GetAccount(ctx context.Context, id int32) (*entity.Account, error)
	GetAccountCredentials(ctx context.Context, requesterID int32, accountID int32) (*entity.AccountCredentialsDTO, error)
	AdminGetAccountCredentials(ctx context.Context, accountID int32) (*entity.AccountCredentialsDTO, error)
}

type api struct {
	business Business
}

func NewAccountAPI(business Business) *api {
	return &api{
		business: business,
	}
}
