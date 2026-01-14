package entity

type AccountDataPatch struct {
	UserID int `json:"user_id" gorm:"column:user_id;index"`

	GameName      string   `json:"game_name" gorm:"column:game_name"`
	Title         string   `json:"title" gorm:"column:title"`
	Description   string   `json:"description" gorm:"column:description;type:text"`
	Price         float64  `json:"price" gorm:"column:price"`
	OriginalPrice *float64 `json:"original_price" gorm:"column:original_price"`
	Thumbnail     string   `json:"thumbnail" gorm:"column:thumbnail"`

	Images []string `json:"images" gorm:"column:images;type:json;serializer:json"`

	Rank   string `json:"rank" gorm:"column:rank"`
	Level  int    `json:"level" gorm:"column:level"`
	Server string `json:"server" gorm:"column:server"`

	Attributes map[string]interface{} `json:"attributes" gorm:"column:attributes;type:json;serializer:json"`

	Features []string `json:"features" gorm:"column:features;type:json;serializer:json"`

	Status AccountStatus `json:"status" gorm:"column:status;type:enum('available','reserved','sold','deleted');default:'available';index"`
}

func (*AccountDataPatch) TableName() string { return Account{}.TableName() }
