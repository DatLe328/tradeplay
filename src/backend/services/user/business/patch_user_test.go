package business

import (
	"context"
	"testing"
	"tradeplay/services/user/business/mocks"
	"tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
)

func TestPacthUser_Success(t *testing.T) {
	repo := mocks.UserRepositoryMock{
		PatchUserByIDFn: func(ctx context.Context, id int, data map[string]interface{}) error {
			return nil
		},
	}

	biz := NewUserBusiness(&repo)

	uid := core.NewUID(1, 1, 1)
	ctx := core.ContextWithRequester(
		context.Background(),
		core.NewRequester(uid.String(), "test"))

	firstName := "dat"
	lastName := "le"

	data := entity.UserDataPatch{
		FirstName: &firstName,
		LastName:  &lastName,
	}
	err := biz.PatchUserProfile(ctx, &data)

	if err != nil {
		t.Fatalf("expect nil error, got %v", err)
	}
}
