package entity

type Filter struct {
	OwnerId  int             `json:"owner_id,omitempty" form:"owner_id"`
	GameName string          `json:"game_name,omitempty" form:"game_name"`
	Status   []AccountStatus `json:"status,omitempty" form:"status"`

	MinPrice *float64 `json:"min_price,omitempty" form:"min_price"`
	MaxPrice *float64 `json:"max_price,omitempty" form:"max_price"`
	Search   string   `json:"search,omitempty" form:"search"`
}
