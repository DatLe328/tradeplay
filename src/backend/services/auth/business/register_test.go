package business

import (
	"context"
	"errors"
	"testing"
	"tradeplay/services/auth/business/mocks"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"
)

func TestRegister_Success(t *testing.T) {
	authRepo := &mocks.AuthRepositoryMock{
		GetAuthFn: func(ctx context.Context, email string) (*authEntity.Auth, error) {
			return nil, errors.New("not found")
		},
		AddAuthFn: func(ctx context.Context, data *authEntity.Auth) error {
			return nil
		},
	}

	userRepo := &mocks.UserRepositoryMock{
		CreateUserFn: func(ctx context.Context, data *userEntity.UserDataCreation) (int, error) {
			return 1, nil
		},
	}

	hasher := &mocks.HasherMock{
		HashPasswordFn: func(salt, password string) (string, error) {
			return "hashed", nil
		},
	}

	biz := NewBusiness(authRepo, userRepo, nil, nil, hasher, nil)

	err := biz.Register(context.Background(), &authEntity.AuthRegister{
		FirstName: "Dat",
		LastName:  "Le",
		AuthEmailPassword: authEntity.AuthEmailPassword{
			Email:    "dat@test.com",
			Password: "12345678",
		},
	})

	if err != nil {
		t.Fatalf("expect nil error, got %v", err)
	}
}
