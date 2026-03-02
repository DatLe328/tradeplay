package gormc

import (
	"context"

	"gorm.io/gorm"
)

type gormTxKey struct{}

// WithGormTx embeds a GORM transaction into a context.
// Called only by repository RunInTransaction implementations.
func WithGormTx(ctx context.Context, tx *gorm.DB) context.Context {
	return context.WithValue(ctx, gormTxKey{}, tx)
}

// GormTxFromContext retrieves a GORM transaction from context if one is active.
// Repository methods call this to decide whether to use the ongoing transaction or the main db.
func GormTxFromContext(ctx context.Context) (*gorm.DB, bool) {
	tx, ok := ctx.Value(gormTxKey{}).(*gorm.DB)
	return tx, ok
}
