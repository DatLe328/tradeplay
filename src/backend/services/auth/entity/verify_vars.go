package entity

type VerifyConfirmDTO struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type UpdateStatusRequest struct {
	Status AuthStatus `json:"status"`
}

type VerifyEmailData struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
}
