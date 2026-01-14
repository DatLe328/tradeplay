package entity

type AdminStats struct {
	TotalAccounts     int64   `json:"totalAccounts"`
	AvailableAccounts int64   `json:"availableAccounts"`
	SoldAccounts      int64   `json:"soldAccounts"`
	PendingOrders     int64   `json:"pendingOrders"`
	TotalRevenue      float64 `json:"totalRevenue"`
}
