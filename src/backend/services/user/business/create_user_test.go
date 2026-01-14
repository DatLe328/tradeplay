package business

import (
	"context"
	"testing"
	"tradeplay/services/user/business/mocks"
	"tradeplay/services/user/entity"
)

func TestCreateUser_Success(t *testing.T) {
	userRepo := mocks.UserRepositoryMock{
		CreateUserFn: func(ctx context.Context, data *entity.UserDataCreation) (int, error) {
			return 1, nil
		},
	}

	biz := NewUserBusiness(&userRepo)

	data := entity.NewUserForCreation("dat", "le")
	_, err := biz.CreateUser(context.Background(), data)

	if err != nil {
		t.Fatalf("expect nil error, got %v", err)
	}
}
