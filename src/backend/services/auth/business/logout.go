package business

import "context"

func (biz *business) Logout(ctx context.Context, refreshToken string) error {
	claims, err := biz.jwtProvider.ParseToken(ctx, refreshToken)
	if err != nil {
		return nil
	}

	err = biz.authRepository.DeleteUserToken(ctx, claims.ID)
	if err != nil {
		return err
	}

	return nil
}
