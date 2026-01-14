package mocks

import (
	"context"
	"tradeplay/services/user/entity"
)

type UserRepositoryMock struct {
	CreateUserFn    func(ctx context.Context, data *entity.UserDataCreation) (int, error)
	GetUserByIDFn   func(ctx context.Context, id int) (*entity.User, error)
	PatchUserByIDFn func(ctx context.Context, id int, data map[string]interface{}) error
}

func (m *UserRepositoryMock) CreateUser(
	ctx context.Context,
	data *entity.UserDataCreation,
) (int, error) {
	return m.CreateUserFn(ctx, data)
}

func (m *UserRepositoryMock) GetUserByID(
	ctx context.Context,
	id int,
) (*entity.User, error) {
	return m.GetUserByIDFn(ctx, id)
}
func (m *UserRepositoryMock) PatchUserByID(
	ctx context.Context,
	id int,
	data map[string]interface{},
) error {
	return m.PatchUserByIDFn(ctx, id, data)
}
