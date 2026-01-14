package business

import (
	"context"
	"testing"
	"tradeplay/services/auth/business/mocks"
	"tradeplay/services/auth/entity"
)

func TestLogin_Success(t *testing.T) {
	hashedPass := "hashed"
	salt := "salt"
	authRepo := &mocks.AuthRepositoryMock{
		GetAuthFn: func(ctx context.Context, email string) (*entity.Auth, error) {
			return &entity.Auth{
				UserID:   1,
				Password: &hashedPass,
				Salt:     &salt,
			}, nil
		},
	}

	hasher := &mocks.HasherMock{
		ComparePasswordFn: func(hashed, salt, password string) bool {
			return true
		},
	}

	jwt := &mocks.JWTProviderMock{
		IssueTokenFn: func(
			ctx context.Context,
			tid, sub string,
			secs int,
		) (string, int, error) {
			return "token", 3600, nil
		},
	}

	biz := NewBusiness(authRepo, nil, jwt, hasher, nil)

	resp, err := biz.Authenticate(context.Background(), &entity.AuthEmailPassword{
		Email:    "dat@test.com",
		Password: "123456",
	})

	if err != nil {
		t.Fatal(err)
	}

	if resp.AccessToken.Token != "token" {
		t.Fatalf("unexpected token")
	}
}
