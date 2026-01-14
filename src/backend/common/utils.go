package common

import "context"

func IsAdmin(ctx context.Context) bool {
	isAdmin, ok := ctx.Value(KeyIsAdmin).(bool)
	return ok && isAdmin
}
