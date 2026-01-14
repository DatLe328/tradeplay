package api

import (
	"context"
	"tradeplay/services/user/entity"
)

type Business interface {
	CreateUser(ctx context.Context, data *entity.UserDataCreation) (int, error)
	GetUserProfile(ctx context.Context) (*entity.User, error)
	PatchUserProfile(ctx context.Context, data *entity.UserDataPatch) error
}

type api struct {
	business Business
}

func NewUserAPI(business Business) *api {
	return &api{
		business: business,
	}
}
