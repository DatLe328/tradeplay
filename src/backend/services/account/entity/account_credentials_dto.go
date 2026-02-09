package entity

type AccountCredentialsDTO struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email,omitempty"`
	ExtraData string `json:"extra_data,omitempty"`
}

func (ai *AccountInfo) ToDTO() *AccountCredentialsDTO {
	if ai == nil {
		return nil
	}
	return &AccountCredentialsDTO{
		Username:  ai.Username,
		Password:  ai.Password,
		Email:     ai.Email,
		ExtraData: ai.ExtraData,
	}
}
