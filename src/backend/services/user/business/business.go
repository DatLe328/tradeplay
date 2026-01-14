package business

import (
	"context"
	"tradeplay/services/user/entity"
)

type UserRepository interface {
	CreateUser(ctx context.Context, data *entity.UserDataCreation) (newUserId int, err error)
	GetUserByID(ctx context.Context, id int) (*entity.User, error)
	PatchUserByID(ctx context.Context, id int, data map[string]interface{}) error
}

type business struct {
	repo UserRepository
}

func NewUserBusiness(repo UserRepository) *business {
	return &business{repo: repo}
}
