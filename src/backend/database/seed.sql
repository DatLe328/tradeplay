-- Insert default system configs
INSERT INTO `system_config` (`key`, `value`, `type`, `description`, `is_public`, `category`) VALUES
-- Pricing
('min_account_price', '10000', 'number', 'Giá tối thiểu cho account (VND)', 1, 'pricing'),
('max_account_price', '100000000', 'number', 'Giá tối đa cho account (VND)', 1, 'pricing'),
('commission_rate', '0.10', 'number', 'Tỉ lệ hoa hồng (10%)', 0, 'pricing'),
('vat_rate', '0.08', 'number', 'Thuế VAT (8%)', 0, 'pricing'),

-- Features
('enable_auto_verify', 'false', 'boolean', 'Tự động verify user mới', 0, 'features'),
('enable_favorites', 'true', 'boolean', 'Cho phép user favorite accounts', 1, 'features'),
('enable_notifications', 'true', 'boolean', 'Bật thông báo', 1, 'features'),
('enable_reviews', 'true', 'boolean', 'Cho phép đánh giá seller', 1, 'features'),

-- Limits
('max_upload_images', '10', 'number', 'Số lượng ảnh tối đa cho 1 account', 1, 'limits'),
('max_active_listings', '50', 'number', 'Số listing active tối đa của 1 user', 1, 'limits'),
('daily_withdrawal_limit', '50000000', 'number', 'Hạn mức rút tiền mỗi ngày (VND)', 0, 'limits'),

-- System
('maintenance_mode', 'false', 'boolean', 'Chế độ bảo trì', 1, 'system'),
('maintenance_message', 'Hệ thống đang bảo trì', 'string', 'Thông báo bảo trì', 1, 'system'),
('site_name', 'TradePlay', 'string', 'Tên website', 1, 'system'),

-- Payment
('bank_account_number', '123456789', 'string', 'Số tài khoản ngân hàng nhận tiền', 0, 'payment'),
('bank_name', 'Vietcombank', 'string', 'Tên ngân hàng', 1, 'payment'),
('payment_methods', '["bank_transfer","momo","vnpay"]', 'json', 'Payment methods enabled', 1, 'payment')
ON DUPLICATE KEY UPDATE `value`=`value`;

-- Sample admin
INSERT INTO `users` (`first_name`, `last_name`, `phone_number`, `system_role`, `status`) 
VALUES ('Admin', 'User', '0901234567', 1, 1);

INSERT INTO `auths` (`user_id`, `auth_type`, `email`, `password`, `status`, `salt`) 
VALUES (1, 0, 'admin@gmail.com', '$2a$10$uD/e/FZkNVKc.aqqsLfFfO2w19Ir4KDw9H.7zSskgc8gOA9JD6jX2', 1, '3N2Nnh8oGjRuWd2J');

INSERT INTO `wallets` (`user_id`, `balance`)
VALUES (1, 1000000.00);


-- Sample user
INSERT INTO `users` (`first_name`, `last_name`, `phone_number`, `system_role`, `status`) 
VALUES ('Normal', 'User', '0901234567', 0, 1);

INSERT INTO `auths` (`user_id`, `auth_type`, `email`, `password`, `status`, `salt`) 
VALUES (2, 0, 'user@gmail.com', '$2a$10$uD/e/FZkNVKc.aqqsLfFfO2w19Ir4KDw9H.7zSskgc8gOA9JD6jX2', 1, '3N2Nnh8oGjRuWd2J');

INSERT INTO `wallets` (`user_id`, `balance`)
VALUES (2, 1000000.00);