package entity

type AuditLogFilter struct {
	UserId     int    `form:"user_id"`
	Action     string `form:"action"`
	Method     string `form:"method"`
	StatusCode int    `form:"status_code"`
	IpAddress  string `form:"ip_address"`

	DateFrom string `form:"date_from"`
	DateTo   string `form:"date_to"`
}

type Paging struct {
	Page  int   `json:"page" form:"page"`
	Limit int   `json:"limit" form:"limit"`
	Total int64 `json:"total"`
}

func (p *Paging) Process() {
	if p.Page <= 0 {
		p.Page = 1
	}
	if p.Limit <= 0 || p.Limit > 100 {
		p.Limit = 20
	}
}
