package mysql

import "context"

func (r *mysqlRepo) UpdatePassword(ctx context.Context, userId int, newPassword string) error {
	return r.db.Table("users").Where("id = ?", userId).Update("password", newPassword).Error
}
