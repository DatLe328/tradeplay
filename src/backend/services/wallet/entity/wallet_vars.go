package entity

type DepositRequest struct {
	Amount float64 `json:"amount" binding:"required,min=10000"`
	Method string  `json:"method" binding:"required"`
}

type WithdrawRequest struct {
	Amount      float64 `json:"amount" binding:"required,min=50000"`
	BankName    string  `json:"bank_name" binding:"required"`
	BankAccount string  `json:"bank_account" binding:"required"`
	BankOwner   string  `json:"bank_owner" binding:"required"`
}
