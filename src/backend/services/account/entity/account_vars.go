package entity

type AccountDataCreation struct {
	CategoryID    int32    `json:"category_id" binding:"required"`
	Title         string   `json:"title" binding:"required"`
	Description   string   `json:"description"`
	Price         int64    `json:"price" binding:"required,min=0"`
	OriginalPrice *int64   `json:"original_price"`
	Thumbnail     string   `json:"thumbnail"`
	Images        []string `json:"images" gorm:"column:images;serializer:json"`

	Attributes map[string]interface{} `json:"attributes" gorm:"column:attributes;serializer:json"`
	Features   []string               `json:"features" gorm:"column:features;serializer:json"`

	Username  string `json:"username"`
	Password  string `json:"password"`
	ExtraData string `json:"extra_data"`
}

type AccountDataUpdate struct {
	OwnerID       *int32   `json:"-"`
	CategoryID    *int32   `json:"category_id"`
	Title         *string  `json:"title"`
	Description   *string  `json:"description"`
	Price         *int64   `json:"price"`
	OriginalPrice *int64   `json:"original_price"`
	Thumbnail     *string  `json:"thumbnail"`
	Images        []string `json:"images" gorm:"column:images;serializer:json"`

	Attributes map[string]interface{} `json:"attributes" gorm:"column:attributes;serializer:json"`
	Features   []string               `json:"features" gorm:"column:features;serializer:json"`
	Status     *AccountStatus         `json:"status"`

	Username  *string `json:"username"`
	Password  *string `json:"password"`
	ExtraData *string `json:"extra_data"`
	Version   int     `json:"version" gorm:"column:version;default:0"`
}

func (*AccountDataCreation) TableName() string { return Account{}.TableName() }
func (*AccountDataUpdate) TableName() string   { return Account{}.TableName() }
