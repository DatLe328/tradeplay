# Notification Service

Notification service cho phép gửi thông báo cho users.

## Cấu trúc

```
notification/
├── entity/
│   └── notification.go           # Entity, DTO, constants
├── repository/
│   ├── interface.go              # Repository interface
│   └── mysql/
│       ├── notification_reader.go # Reader operations
│       └── notification_writer.go # Writer operations
├── business/
│   ├── business.go               # Business interface
│   └── methods.go                # Business methods
├── transport/
│   └── api/
│       ├── api.go                # API interface
│       └── handlers.go           # HTTP handlers
├── helper.go                      # Helper function
└── README.md
```

## Notification Types

```
- 0: order_status      (thay đổi trạng thái đơn hàng)
- 1: account_sold      (tài khoản được bán)
- 2: promotion         (khuyến mãi)
- 3: system            (thông báo hệ thống)
- 4: message           (tin nhắn từ người dùng khác)
```

## API Endpoints

### Lấy danh sách thông báo
```
GET /v1/notifications?limit=20&offset=0

Response:
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "user_id": 123,
        "type": 0,
        "title": "Order Updated",
        "message": "Your order #123 has been shipped",
        "data": null,
        "action_url": "/orders/123",
        "is_read": false,
        "read_at": null,
        "created_at": "2024-01-30T10:30:00Z",
        "updated_at": "2024-01-30T10:30:00Z"
      }
    ],
    "total": 1,
    "limit": 20
  }
}
```

### Lấy chi tiết thông báo
```
GET /v1/notifications/:id

Response:
{
  "code": 200,
  "data": { ... }  // NotificationDTO
}
```

### Đánh dấu thông báo đã đọc
```
PATCH /v1/notifications/:id/read

Response:
{
  "code": 200,
  "message": "Success"
}
```

### Lấy số thông báo chưa đọc
```
GET /v1/notifications/unread/count

Response:
{
  "code": 200,
  "data": {
    "unread_count": 5
  }
}
```

### Xóa thông báo
```
DELETE /v1/notifications/:id

Response:
{
  "code": 200,
  "message": "Success"
}
```

## Sử dụng trong Business Logic

### Tạo notification từ service khác

```go
import "tradeplay/src/backend/services/notification"

// Trong business method của service khác
notificationRepo := // lấy từ repository...
notification, err := notification.CreateNotification(
    ctx,
    notificationRepo,
    userID,
    entity.NotificationTypeOrderStatus,
    "Đơn hàng cập nhật",
    "Đơn hàng #123 đã được gửi đi",
    nil, // data (optional)
    &actionURL, // action_url (optional)
)
```

### Sử dụng trong Composer

```go
// Trong service composer của bạn
notificationRepo := // initialize repository...

// Gọi helper
notification, err := notification.CreateNotification(
    ctx,
    notificationRepo,
    buyerID,
    entity.NotificationTypeAccountSold,
    "Tài khoản bị bán",
    fmt.Sprintf("Tài khoản %d của bạn đã được bán cho user khác", accountID),
    nil,
    nil,
)
```

## Security

- Mỗi user chỉ có thể xem/chỉnh sửa thông báo của mình
- Middleware `RequireAuth` bắt buộc cho tất cả endpoints
- CSRF validation bắt buộc cho state-changing operations (PATCH, DELETE)

## Database

Bảng `notifications` có indexes cho:
- `idx_notifications_user_unread`: Tối ưu cho query lấy thông báo chưa đọc
- `idx_notifications_type`: Tối ưu cho filter theo loại thông báo

Foreign key tới `users` table với ON DELETE CASCADE.

## TODO: Integrations

Cần integrate notification creation ở:
- [ ] Order service (khi order được tạo, cập nhật status)
- [ ] Account service (khi account được bán)
- [ ] Payment service (khi thanh toán thành công/thất bại)
- [ ] System notifications (bảo trì, cập nhật)
