package middleware

import (
	"context"
	"tradeplay/services/user/entity"
)

type UserStore interface {
	GetUserByID(ctx context.Context, id int32) (*entity.User, error)
}
