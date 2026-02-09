package entity

type Filter struct {
	OwnerId    int             `json:"owner_id,omitempty" form:"owner_id"`
	CategoryId int             `json:"category_id,omitempty" form:"category_id"`
	Status     []AccountStatus `json:"status,omitempty" form:"status"`

	MinPrice *int32 `json:"min_price,omitempty" form:"min_price"`
	MaxPrice *int32 `json:"max_price,omitempty" form:"max_price"`
	Search   string `json:"search,omitempty" form:"search"`
	Sort     string `json:"sort,omitempty" form:"sort"`
}
