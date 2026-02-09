package business

import (
	"context"
	"tradeplay/common"
	"tradeplay/services/account/entity"
	auditEntity "tradeplay/services/audit/entity"

	"gorm.io/gorm"
)

type accountRepository interface {
	GetDB() *gorm.DB
	GetAccountInfoByAccountID(ctx context.Context, accountID int32) (*entity.AccountInfo, error)
	GetAccountByID(ctx context.Context, id int32) (*entity.Account, error)
	GetAccountByIDForUpdate(ctx context.Context, tx *gorm.DB, id int32) (*entity.Account, error)
	FindAccounts(ctx context.Context, filter *entity.Filter, paging *common.Paging) ([]entity.Account, error)

	CreateAccount(ctx context.Context, tx *gorm.DB, data *entity.Account) error
	CreateAccountInfo(ctx context.Context, tx *gorm.DB, data *entity.AccountInfo) error

	UpdateAccountInfo(ctx context.Context, tx *gorm.DB, accountID int32, data *entity.AccountInfo) error
	UpdateAccount(ctx context.Context, tx *gorm.DB, id int32, data *entity.AccountDataUpdate, currentVersion int) error

	DeleteAccount(ctx context.Context, id int32) error
}

type orderRepository interface {
	DeleteOrdersByAccountId(ctx context.Context, accountId int32) error
	HasUserPurchasedAccount(ctx context.Context, userID int32, accountID int32) (bool, error)
}

type auditRepository interface {
	PushAuditLog(ctx context.Context, log *auditEntity.AuditLog)
}

type business struct {
	accountRepo     accountRepository
	orderRepo       orderRepository
	auditRepo       auditRepository
	uploadComponent common.UploadComponent
	appSecretKey    string
}

func NewAccountBusiness(
	accRepo accountRepository,
	orderRepo orderRepository,
	uploadComponent common.UploadComponent,
	appSecretKey string,
	auditRepo auditRepository,
) *business {
	return &business{
		accountRepo:     accRepo,
		orderRepo:       orderRepo,
		auditRepo:       auditRepo,
		uploadComponent: uploadComponent,
		appSecretKey:    appSecretKey,
	}
}
