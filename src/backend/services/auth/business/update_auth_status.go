package business

import (
	"context"
	"tradeplay/services/auth/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) UpdateAuthStatus(ctx context.Context, email string, status entity.AuthStatus) error {
	err := biz.authRepository.UpdateAuthStatus(ctx, email, status)
	if err != nil {
		return core.ErrInternal(err)
	}
	return nil
}
