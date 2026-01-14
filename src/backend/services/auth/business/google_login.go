package business

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"time"
	"tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"github.com/DatLe328/service-context/core"
	"github.com/google/uuid"
)

type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

func (biz *business) LoginWithGoogle(ctx context.Context, code string) (*entity.TokenResponse, error) {
	googleToken, err := biz.exchangeGoogleToken(code)
	if err != nil {
		return nil, core.ErrInvalidRequest(err)
	}

	googleUser, err := biz.getGoogleUserInfo(googleToken)
	if err != nil {
		return nil, core.ErrInvalidRequest(err)
	}

	authData, err := biz.authRepository.FindAuthByGoogleIDOrEmail(ctx, googleUser.ID, googleUser.Email)

	var userID int

	if err == nil && authData != nil {
		if authData.Status == entity.AuthStatusBanned {
			return nil, core.ErrAccountLocked(errors.New("account has been banned"))
		}

		userID = int(authData.UserID)

		if *authData.GoogleID == "" {
			_ = biz.authRepository.UpdateAuthGoogleID(ctx, authData.Id, googleUser.ID)
		}

	} else {
		newUser := &userEntity.User{
			FirstName:  googleUser.GivenName,
			LastName:   googleUser.FamilyName,
			SystemRole: "user",
			Status:     1,
		}

		if newUser.FirstName == "" {
			newUser.FirstName = googleUser.Name
		}

		newAuth := &entity.Auth{
			AuthType: entity.AuthTypeGoogle,
			Email:    googleUser.Email,
			GoogleID: &googleUser.ID,
			Status:   entity.AuthStatusActive,
		}

		if err := biz.authRepository.CreateUserAndAuthGoogle(ctx, newUser, newAuth); err != nil {
			return nil, core.ErrInternal(err)
		}

		userID = newUser.Id
	}

	uid := core.NewUID(uint32(userID), 1, 1)
	sub := uid.String()

	accessTid := uuid.New().String()
	accessToken, accessExp, err := biz.jwtProvider.IssueToken(ctx, accessTid, sub, 0)
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	refreshTid := uuid.New().String()
	refreshToken, refreshExp, err := biz.jwtProvider.IssueToken(ctx, refreshTid, sub, 2592000)
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	err = biz.authRepository.CreateUserToken(ctx, &entity.UserToken{
		UserId:    userID,
		TokenId:   refreshTid,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Second * time.Duration(refreshExp)),
		IsRevoked: false,
	})
	if err != nil {
		return nil, core.ErrInternal(err)
	}

	return &entity.TokenResponse{
		AccessToken: entity.Token{
			Token:     accessToken,
			ExpiredIn: accessExp,
		},
		RefreshToken: &entity.Token{
			Token:     refreshToken,
			ExpiredIn: refreshExp,
		},
	}, nil
}

func (biz *business) exchangeGoogleToken(code string) (string, error) {
	resp, err := http.PostForm("https://oauth2.googleapis.com/token", url.Values{
		"client_id":     {os.Getenv("GOOGLE_CLIENT_ID")},
		"client_secret": {os.Getenv("GOOGLE_CLIENT_SECRET")},
		"redirect_uri":  {os.Getenv("GOOGLE_REDIRECT_URL")},
		"code":          {code},
		"grant_type":    {"authorization_code"},
	})
	if err != nil {
		return "", fmt.Errorf("connect google failed: %v", err)
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", fmt.Errorf("decode token failed: %v", err)
	}

	if tokenResp.AccessToken == "" {
		return "", errors.New("empty access token")
	}

	return tokenResp.AccessToken, nil
}

func (biz *business) getGoogleUserInfo(accessToken string) (*GoogleUser, error) {
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, fmt.Errorf("get user info failed: %v", err)
	}
	defer resp.Body.Close()

	var gUser GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&gUser); err != nil {
		return nil, fmt.Errorf("decode user info failed: %v", err)
	}

	return &gUser, nil
}
