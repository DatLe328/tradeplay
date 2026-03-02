package common

type Paging struct {
	Limit      int    `json:"limit"       form:"limit"`
	Cursor     string `json:"cursor"      form:"cursor"`      // client gửi lên (last ID hoặc composite)
	NextCursor string `json:"next_cursor"`                    // server trả về cho lần gọi tiếp theo
	HasMore    bool   `json:"has_more"`
}

func (p *Paging) Process() {
	if p.Limit <= 0 {
		p.Limit = 10
	}

	if p.Limit > 200 {
		p.Limit = 200
	}
}
