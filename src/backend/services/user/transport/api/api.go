package api

import (
	"context"
	"tradeplay/services/user/entity"
)

type Business interface {
	GetUserByID(ctx context.Context, userID int32) (*entity.User, error)
	PatchUserProfile(ctx context.Context, data *entity.UserUpdateDTO) error
}

type api struct {
	business Business
}

func NewUserAPI(business Business) *api {
	return &api{
		business: business,
	}
}
