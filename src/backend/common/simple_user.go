package common

type SimpleUser struct {
	SQLModel
	LastName  string `json:"last_name" gorm:"column:last_name;" db:"last_name"`
	FirstName string `json:"first_name" gorm:"column:first_name;" db:"first_name"`
}

func (SimpleUser) TableName() string {
	return "users"
}

func NewSimpleUser(id int32, firstName, lastName string) SimpleUser {
	return SimpleUser{
		SQLModel:  SQLModel{ID: id},
		LastName:  lastName,
		FirstName: firstName,
	}
}
