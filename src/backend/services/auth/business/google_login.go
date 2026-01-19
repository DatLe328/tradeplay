package business

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"
	"tradeplay/common"
	"tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"
	walletEntity "tradeplay/services/wallet/entity"

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

func (biz *business) LoginWithGoogle(
	ctx context.Context,
	code string,
	userAgent, ipAddress string,
) (*entity.TokenResponse, error) {
	googleToken, err := biz.exchangeGoogleToken(code)
	if err != nil {
		return nil, core.ErrInvalidRequest(err)
	}
	googleUser, err := biz.getGoogleUserInfo(googleToken)
	if err != nil {
		return nil, core.ErrInvalidRequest(err)
	}

	authGoogle, err := biz.authRepository.FindAuthByGoogleID(ctx, googleUser.ID)

	var userID int

	if err == nil && authGoogle != nil {
		if authGoogle.Status == entity.AuthStatusSuspended {
			return nil, core.ErrAccountLocked(errors.New("account has been suspended"))
		}
		userID = int(authGoogle.UserID)
	} else {
		authByEmail, errEmail := biz.authRepository.GetAuth(ctx, googleUser.Email)

		if errEmail == nil && authByEmail != nil {
			userID = int(authByEmail.UserID)

			if authByEmail.Status == entity.AuthStatusSuspended {
				return nil, core.ErrAccountLocked(errors.New("account has been suspended"))
			}

			newAuth := &entity.Auth{
				UserID:   int64(userID),
				AuthType: entity.AuthTypeGoogle,
				Email:    googleUser.Email,
				GoogleID: &googleUser.ID,
				Status:   entity.AuthStatusVerified,
			}

			if err := biz.authRepository.AddAuth(ctx, newAuth); err != nil {
				return nil, core.ErrInternal(err)
			}

		} else {
			newUser := userEntity.NewUser(googleUser.GivenName, googleUser.FamilyName)
			newUser.Status = userEntity.StatusActive
			if newUser.FirstName == "" {
				newUser.FirstName = googleUser.Name
			}

			newAuth := &entity.Auth{
				AuthType: entity.AuthTypeGoogle,
				Email:    googleUser.Email,
				GoogleID: &googleUser.ID,
				Status:   entity.AuthStatusVerified,
			}

			if err := biz.authRepository.CreateUserAndAuthGoogle(ctx, newUser, newAuth); err != nil {
				return nil, core.ErrInternal(err)
			}
			userID = newUser.Id
		}
	}
	existingWallet, err := biz.walletRepository.GetWalletByUserID(ctx, userID, common.DefaultCurrency)

	if err != nil || existingWallet == nil {
		newWallet := &walletEntity.Wallet{
			UserId:   userID,
			Balance:  0,
			Currency: common.DefaultCurrency,
		}

		if err := biz.walletRepository.CreateWallet(ctx, newWallet); err != nil {
			log.Printf("[WARNING] GoogleLogin: Failed to create wallet for user %d: %v\n", userID, err)
			return nil, core.ErrInternal(err)
		}
	}

	uid := core.NewUID(uint32(userID), common.MaskTypeAuth, 1)
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
		UserAgent: userAgent,
		IpAddress: ipAddress,
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
