package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

type AccountRepository interface {
	CreateAccount(ctx context.Context, data *entity.Account) error
	UpdateAccount(ctx context.Context, id int, data *entity.AccountDataUpdate) error
	GetAccountByID(ctx context.Context, id int) (*entity.Account, error)
	GetAccountList(ctx context.Context, filter *entity.Filter, paging *core.Paging) ([]entity.Account, error)
	DeleteAccount(ctx context.Context, id int) error
}

type OrderRepository interface {
	DeleteOrdersByAccountId(ctx context.Context, accountId int) error
}

type business struct {
	accountRepo     AccountRepository
	orderRepo       OrderRepository
	uploadComponent common.UploadComponent
}

func NewAccountBusiness(accRepo AccountRepository, orderRepo OrderRepository, uploadComponent common.UploadComponent) *business {
	return &business{
		accountRepo:     accRepo,
		orderRepo:       orderRepo,
		uploadComponent: uploadComponent,
	}
}
