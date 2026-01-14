package business

import (
	"context"
	"testing"
	"tradeplay/services/user/business/mocks"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func TestGetUser_Success(t *testing.T) {
	repo := mocks.UserRepositoryMock{
		GetUserByIDFn: func(ctx context.Context, id int) (*entity.User, error) {
			if id == 1 {
				return &entity.User{
					FirstName: "Dat",
					LastName:  "Le",
				}, nil
			}
			return nil, core.ErrCannotGetEntity(entity.User{}.TableName(), entity.ErrCannotGetUser)
		},
	}

	biz := NewUserBusiness(&repo)
	uid := core.NewUID(1, 1, 1)

	ctx := core.ContextWithRequester(
		context.Background(),
		core.NewRequester(uid.String(), "test"),
	)

	_, err := biz.GetUserProfile(ctx)

	if err != nil {
		t.Fatalf("expect nil error, got %v", err)
	}
}
