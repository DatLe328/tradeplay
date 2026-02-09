package business

import (
	"context"
	"time"
	"tradeplay/common"
	auditEntity "tradeplay/services/audit/entity"
	authEntity "tradeplay/services/auth/entity"
	userEntity "tradeplay/services/user/entity"

	"github.com/google/uuid"
)

func (biz *business) Authenticate(
	ctx context.Context,
	data *authEntity.AuthEmailPasswordDTO,
	userAgent string,
	ipAddress string,
) (*authEntity.TokenResponse, error) {
	logLoginAttempt := func(userID int32, success bool, failReason string) {
		action := common.ActionLoginFailed
		statusCode := 401
		if success {
			action = common.ActionLoginSuccess
			statusCode = 200
		}

		biz.auditRepository.PushAuditLog(ctx, &auditEntity.AuditLog{
			UserId:     userID,
			Action:     action,
			Payload:    auditEntity.JSONMap{"email": data.Email},
			IpAddress:  ipAddress,
			UserAgent:  userAgent,
			StatusCode: statusCode,
			ErrorMsg:   failReason,
			Method:     "POST",
			Path:       "/auth/login",
		})
	}
	authData, err := biz.authRepository.GetAuthByEmail(ctx, data.Email)

	if err != nil {
		logLoginAttempt(0, false, err.Error())
		return nil, common.ErrInvalidRequest(authEntity.ErrLoginFailed)
	}

	if authData.Status == authEntity.AuthStatusSuspended {
		logLoginAttempt(authData.UserID, false, authEntity.ErrAuthSuspended.Error())
		return nil, common.ErrAccountLocked(authEntity.ErrAuthSuspended)
	}

	if authData.Status == authEntity.AuthStatusUnverified {
		logLoginAttempt(authData.UserID, false, authEntity.ErrAuthUnverified.Error())
		return nil, common.ErrInvalidRequest(authEntity.ErrAuthUnverified)
	}

	if authData.Password == nil || authData.Salt == nil {
		logLoginAttempt(authData.UserID, false, authEntity.ErrPasswordEmpty.Error())
		return nil, common.ErrInvalidRequest(authEntity.ErrLoginFailed)
	}

	user, err := biz.userBusiness.GetUserByID(ctx, authData.UserID)
	if err != nil {
		return nil, common.ErrInternal(err)
	}

	if user.Status == userEntity.StatusBanned {
		logLoginAttempt(authData.UserID, false, userEntity.ErrUserBanned.Error())
		return nil, common.ErrAccountLocked(userEntity.ErrUserBanned)
	}

	if user.Status == userEntity.StatusInactive {
		return nil, common.ErrInvalidRequest(userEntity.ErrUserInactive)
	}

	if !biz.hasher.CompareHashPassword(*authData.Password, *authData.Salt, data.Password) {
		logLoginAttempt(authData.UserID, false, authEntity.ErrPasswordIsNotValid.Error())
		return nil, common.ErrInvalidRequest(authEntity.ErrLoginFailed)
	}

	uid := common.NewUID(uint32(authData.UserID), common.DbTypeAuth, 1)
	sub := uid.String()

	accessTid := uuid.New().String()
	accessToken, accessExp, err := biz.jwtProvider.IssueToken(ctx, accessTid, sub, 3600)
	if err != nil {
		return nil, common.ErrInternal(err)
	}

	refreshTid := uuid.New().String()
	refreshToken, refreshExp, err := biz.jwtProvider.IssueToken(ctx, refreshTid, sub, 2592000)
	if err != nil {
		return nil, common.ErrInternal(err)
	}

	err = biz.authRepository.CreateUserToken(ctx, &authEntity.UserToken{
		UserId:    authData.UserID,
		TokenId:   refreshTid,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Second * time.Duration(refreshExp)),
		IsRevoked: false,
		UserAgent: userAgent,
		IpAddress: ipAddress,
	})
	if err != nil {
		return nil, common.ErrInternal(err)
	}

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
