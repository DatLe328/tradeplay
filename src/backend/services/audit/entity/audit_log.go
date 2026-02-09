package entity

import (
	"database/sql/driver"
	"encoding/json"
	"tradeplay/common"
)

type JSONMap map[string]interface{}

func (j JSONMap) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *JSONMap) Scan(value interface{}) error {
	return json.Unmarshal(value.([]byte), j)
}

type AuditLog struct {
	common.SQLModel
	UserId int32  `gorm:"column:user_id;index" json:"user_id"`
	Method string `gorm:"column:method;size:10" json:"method"`
	Path   string `gorm:"column:path;size:255" json:"path"`
	Action string `gorm:"column:action;size:50;index" json:"action"`

	Payload   JSONMap `gorm:"column:payload;type:json" json:"payload"`
	PrevState JSONMap `gorm:"column:prev_state;type:json" json:"prev_state"`
	NewState  JSONMap `gorm:"column:new_state;type:json" json:"new_state"`

	IpAddress  string `gorm:"column:ip_address;size:50" json:"ip_address"`
	UserAgent  string `gorm:"column:user_agent;type:text" json:"user_agent"`
	StatusCode int    `gorm:"column:status_code" json:"status_code"`
	ErrorMsg   string `gorm:"column:error_msg;type:text" json:"error_msg"`
	Duration   int32  `gorm:"column:duration" json:"duration"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
}

func (a *AuditLog) Mask() {
	a.SQLModel.Mask(common.MaskTypeAuditLog)
}
