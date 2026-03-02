package mysql

import (
	"context"

	"tradeplay/components/gormc"

	"gorm.io/gorm"
)

type mysqlRepo struct {
	db *gorm.DB
}

func NewMySQLRepository(db *gorm.DB) *mysqlRepo {
	return &mysqlRepo{db: db}
}

// getDB returns the active transaction from context, or the main db if none.
func (repo *mysqlRepo) getDB(ctx context.Context) *gorm.DB {
	if tx, ok := gormc.GormTxFromContext(ctx); ok {
		return tx
	}
	return repo.db
}

// RunInTransaction starts a DB transaction and embeds it in the context passed to fn.
func (repo *mysqlRepo) RunInTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	return repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(gormc.WithGormTx(ctx, tx))
	})
}
