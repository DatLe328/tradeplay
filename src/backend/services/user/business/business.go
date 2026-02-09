package business

import (
	"context"
	"tradeplay/services/user/entity"
)

type userRepository interface {
	CreateUser(ctx context.Context, data *entity.UserCreateDTO) (newUserId int32, err error)
	GetUserByID(ctx context.Context, id int32) (*entity.User, error)
	PatchUserByID(ctx context.Context, id int32, data map[string]interface{}) error
}

type business struct {
	repo userRepository
}

func NewUserBusiness(repo userRepository) *business {
	return &business{repo: repo}
}
