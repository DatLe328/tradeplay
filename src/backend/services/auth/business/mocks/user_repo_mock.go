package mocks

import (
	"context"
	userEntity "tradeplay/services/user/entity"
)

type UserRepositoryMock struct {
	CreateUserFn func(
		ctx context.Context,
		data *userEntity.UserDataCreation,
	) (int, error)

	CreateUserCalled int
}

func (m *UserRepositoryMock) CreateUser(
	ctx context.Context,
	data *userEntity.UserDataCreation,
) (int, error) {
	m.CreateUserCalled++
	return m.CreateUserFn(ctx, data)
}

func (m *UserRepositoryMock) GetUserByID(ctx context.Context, id int) (*userEntity.User, error)
func (m *UserRepositoryMock) DeleteUser(ctx context.Context, id int) error
