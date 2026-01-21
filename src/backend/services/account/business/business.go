package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

type AccountRepository interface {
	GetDB() *gorm.DB
	CreateAccount(ctx context.Context, tx *gorm.DB, data *entity.Account) error
	CreateAccountInfo(ctx context.Context, tx *gorm.DB, data *entity.AccountInfo) error
	GetAccountInfoByAccountID(ctx context.Context, accountId int) (*entity.AccountInfo, error)
	UpdateAccountInfo(ctx context.Context, tx *gorm.DB, accountId int, data *entity.AccountInfo) error
	UpdateAccount(ctx context.Context, tx *gorm.DB, id int, data *entity.AccountDataUpdate) error

	GetAccountByID(ctx context.Context, id int) (*entity.Account, error)
	GetAccountList(ctx context.Context, filter *entity.Filter, paging *core.Paging) ([]entity.Account, error)
	DeleteAccount(ctx context.Context, id int) error
}

type OrderRepository interface {
	DeleteOrdersByAccountId(ctx context.Context, accountId int) error
	HasUserPurchasedAccount(ctx context.Context, userId int, accountId int) (bool, error)
}

type business struct {
	accountRepo     AccountRepository
	orderRepo       OrderRepository
	uploadComponent common.UploadComponent
	appSecretKey    string
}

func NewAccountBusiness(
	accRepo AccountRepository,
	orderRepo OrderRepository,
	uploadComponent common.UploadComponent,
	appSecretKey string,
) *business {
	return &business{
		accountRepo:     accRepo,
		orderRepo:       orderRepo,
		uploadComponent: uploadComponent,
		appSecretKey:    appSecretKey,
	}
}
