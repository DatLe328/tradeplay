package business

import (
	"context"
	"fmt"
	"time"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"github.com/google/uuid"
)

func (biz *business) LoginWithGoogle(
	ctx context.Context,
	code string,
	userAgent, ipAddress string,
) (*authEntity.TokenResponse, error) {
	googleToken, err := authEntity.ExchangeGoogleToken(code)
	if err != nil {
		return nil, common.ErrInvalidRequest(err)
	}
	googleUser, err := authEntity.GetGoogleUserInfo(googleToken)
	if err != nil {
		return nil, common.ErrInvalidRequest(err)
	}

	logGoogleLogin := func(uid int32, success bool, msg string) {
		action := common.ActionLoginGoogleSuccess
		code := 200
		if !success {
			action = common.ActionLoginGoogleFailed
			code = 400
		}
		biz.auditRepository.PushAuditLog(context.Background(), &auditEntity.AuditLog{
			UserId:     uid,
			Action:     action,
			Payload:    auditEntity.JSONMap{"email": googleUser.Email, "google_id": googleUser.ID},
			IpAddress:  ipAddress,
			UserAgent:  userAgent,
			StatusCode: code,
			ErrorMsg:   msg,
			Method:     "POST",
			Path:       "/auth/google-login",
		})
	}

	authGoogle, err := biz.authRepository.GetAuthByGoogleID(ctx, googleUser.ID)
	var userID int32

	if err == nil && authGoogle != nil {
		if authGoogle.Status == authEntity.AuthStatusSuspended {
			logGoogleLogin(authGoogle.UserID, false, authEntity.ErrAuthSuspended.Error())
			return nil, common.ErrAccountLocked(authEntity.ErrAuthSuspended)
		}
		userID = authGoogle.UserID
	} else {
		authByEmail, errEmail := biz.authRepository.GetAuthByEmail(ctx, googleUser.Email)

		if errEmail == nil && authByEmail != nil {
			userID = authByEmail.UserID

			if authByEmail.Status == authEntity.AuthStatusSuspended {
				logGoogleLogin(userID, false, authEntity.ErrAuthSuspended.Error())
				return nil, common.ErrAccountLocked(authEntity.ErrAuthSuspended)
			}

			newAuth := &authEntity.Auth{
				UserID:   userID,
				AuthType: authEntity.AuthTypeGoogle,
				Email:    googleUser.Email,
				GoogleID: &googleUser.ID,
				Status:   authEntity.AuthStatusVerified,
			}

			if err := biz.authRepository.CreateAuth(ctx, newAuth); err != nil {
				logGoogleLogin(userID, false, err.Error())
				return nil, common.ErrInternal(err)
			}

		} else {
			newUser := userEntity.NewUser(googleUser.GivenName, googleUser.FamilyName)
			newUser.Status = userEntity.StatusActive
			if newUser.FirstName == "" {
				newUser.FirstName = googleUser.Name
			}

			newAuth := &authEntity.Auth{
				AuthType: authEntity.AuthTypeGoogle,
				Email:    googleUser.Email,
				GoogleID: &googleUser.ID,
				Status:   authEntity.AuthStatusVerified,
			}

			if err := biz.authRepository.CreateUserAndAuthGoogle(ctx, newUser, newAuth); err != nil {
				logGoogleLogin(0, false, fmt.Sprintf("Create user failed: %v", err))
				return nil, common.ErrInternal(err)
			}
			userID = newUser.ID
		}
	}

	existingWallet, err := biz.walletBusiness.GetUserWallet(ctx, userID)
	if err != nil || existingWallet == nil {
		if err := biz.walletBusiness.CreateWallet(ctx, userID); err != nil {
			logGoogleLogin(userID, false, fmt.Sprintf("Create wallet failed: %v", err))
		}
	}

	user, err := biz.userBusiness.GetUserByID(ctx, userID)
	if err == nil && user != nil {
		if user.Status == userEntity.StatusBanned {
			logGoogleLogin(userID, false, userEntity.ErrUserBanned.Error())
			return nil, common.ErrAccountLocked(userEntity.ErrUserBanned)
		}
	}

	uid := common.NewUID(uint32(userID), common.DbTypeAuth, 1)
	sub := uid.String()

	accessTid := uuid.New().String()
	accessToken, accessExp, err := biz.jwtProvider.IssueToken(ctx, accessTid, sub, 0)
	if err != nil {
		return nil, common.ErrInternal(err)
	}

	refreshTid := uuid.New().String()
	refreshToken, refreshExp, err := biz.jwtProvider.IssueToken(ctx, refreshTid, sub, 2592000)
	if err != nil {
		return nil, common.ErrInternal(err)
	}

	userToken := authEntity.NewUserToken(
		userID,
		refreshTid,
		refreshToken,
		time.Now().Add(time.Second*time.Duration(refreshExp)),
		ipAddress,
		userAgent,
	)

	err = biz.authRepository.CreateUserToken(ctx, userToken)
	if err != nil {
		return nil, common.ErrInternal(err)
	}

	logGoogleLogin(userID, true, "")

	return &authEntity.TokenResponse{
		AccessToken: authEntity.Token{
			Token:     accessToken,
			ExpiredIn: accessExp,
		},
		RefreshToken: &authEntity.Token{
			Token:     refreshToken,
			ExpiredIn: refreshExp,
		},
	}, nil
}
