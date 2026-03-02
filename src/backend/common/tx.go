package common

import "context"

type TxManager interface {
	RunInTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}
