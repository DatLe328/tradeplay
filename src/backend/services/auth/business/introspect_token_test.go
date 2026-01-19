package business

import (
	"context"
	"testing"
	"tradeplay/services/auth/business/mocks"

	"github.com/golang-jwt/jwt/v5"
)

func TestIntrospectToken_Success(t *testing.T) {
	jwt := &mocks.JWTProviderMock{
		ParseTokenFn: func(ctx context.Context, token string) (*jwt.RegisteredClaims, error) {
			return &jwt.RegisteredClaims{
				Subject: "user-1",
			}, nil
		},
	}

	biz := NewBusiness(nil, nil, nil, jwt, nil, nil)

	claims, err := biz.IntrospectToken(context.Background(), "token")

	if err != nil {
		t.Fatal(err)
	}

	if claims.Subject != "user-1" {
		t.Fatalf("unexpected subject")
	}
}
