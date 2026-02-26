CREATE DATABASE IF NOT EXISTS tradeplay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tradeplay_db;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  
  -- Role: 0=user, 1=admin. 
  `system_role` TINYINT NOT NULL DEFAULT 0,
  
  -- Status: 0=inactive, 1=active, 2=banned.
  `status` TINYINT NOT NULL DEFAULT 0,

  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `idx_users_role_status` (`system_role`, `status`),
  INDEX `idx_users_deleted_at` (`deleted_at`),
  UNIQUE INDEX `uk_users_phone` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `auths` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  -- 0=email/password, 1=google.
  `auth_type` TINYINT NOT NULL DEFAULT 0,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `salt` VARCHAR(50) DEFAULT NULL,
  `google_id` VARCHAR(150) DEFAULT NULL,
  -- 0=unverified, 1=verified, 2=suspended.
  `status` TINYINT NOT NULL DEFAULT 0,
  
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_auths_email_type` (`email`, `auth_type`),
  INDEX `idx_auths_user_id` (`user_id`),
  INDEX `idx_auths_email` (`email`),
  UNIQUE INDEX `uk_auths_google_id` (`google_id`),
  
  CONSTRAINT `fk_auths_users` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `user_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_id` VARCHAR(50) NOT NULL,
  `token` TEXT NOT NULL,
  
  `expires_at` DATETIME(3) NOT NULL,
  `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_tokens_token_id` (`token_id`),
  INDEX `idx_tokens_user_active` (`user_id`, `is_revoked`),
  INDEX `idx_tokens_expires` (`expires_at`),
  
  CONSTRAINT `fk_tokens_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `verify_codes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(150) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  -- Type: 0=email_verify, 1=password_reset, 2=2fa, 3=phone_verify...
  `type` TINYINT NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  
  `expired_at` DATETIME(3) NOT NULL,
  `used_at` DATETIME(3) NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_verify_query` (`email`, `type`, `code`, `is_used`),
  INDEX `idx_verify_cleanup` (`expired_at`, `is_used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `description` TEXT,
  `display_order` INT DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1, -- 1=active, 0=hidden
  
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_category_slug` (`slug`),
  INDEX `idx_category_status` (`status`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  
  `owner_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` BIGINT NOT NULL,
  `original_price` BIGINT NULL,
  `thumbnail` VARCHAR(500) NULL,
  `images` JSON NULL,
  `attributes` JSON NULL,
  `features` JSON NULL,
  `status` TINYINT NOT NULL DEFAULT 0, -- 0=draft, 1=available, 2=reserved, 3=sold, 4=deleted
  `view_count` INT DEFAULT 0,
  `version` INT NOT NULL DEFAULT 0, -- Thêm để dùng Optimistic Locking (chống mua trùng)
  
  PRIMARY KEY (`id`),
  
  -- Index đã được cập nhật theo category_id
  INDEX `idx_owner_status` (`owner_id`, `status`),
  INDEX `idx_category_status` (`category_id`, `status`),
  INDEX `idx_status_price` (`status`, `price`),
  INDEX `idx_cat_price_status` (`category_id`, `price`, `status`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_created_at` (`created_at`),
  
  FULLTEXT INDEX `ft_title_desc` (`title`, `description`),
  
  CONSTRAINT `fk_accounts_owner` FOREIGN KEY (`owner_id`) 
    REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_accounts_category` FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `account_infos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  `account_id` INT NOT NULL,
  
  `username` VARCHAR(255) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  
  `extra_data` TEXT,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account_infos_account_id` (`account_id`),
  CONSTRAINT `fk_account_infos_accounts` FOREIGN KEY (`account_id`) 
    REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  `user_id` INT NOT NULL,
  `account_id` INT NULL,
  
  `total_price` BIGINT NOT NULL,
  
  -- 0=pending, 1=paid, 2=completed, 3=cancelled, 4=refunded
  `status` TINYINT NOT NULL DEFAULT 0,
  -- 0=buy_account, 1=deposit
  `type` TINYINT NOT NULL DEFAULT 0,
  
  `payment_method` VARCHAR(50),
  `payment_trans_id` VARCHAR(255) NULL DEFAULT NULL,
  `payment_ref` VARCHAR(255),
  `notes` TEXT,

  PRIMARY KEY (`id`),
  
  INDEX `idx_orders_user_status` (`user_id`, `status`),
  INDEX `idx_orders_status_type` (`status`, `type`),
  INDEX `idx_orders_user_created` (`user_id`, `created_at`),
  INDEX `idx_orders_payment_ref` (`payment_ref`),
  INDEX `idx_orders_account_id` (`account_id`),

  CONSTRAINT `fk_orders_users` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_orders_accounts` FOREIGN KEY (`account_id`) 
    REFERENCES `accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `order_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  
  -- 0=pending, 1=paid, 2=completed, 3=cancelled, 4=refunded
  `old_status` TINYINT,
  `new_status` TINYINT NOT NULL,
  
  `note` TEXT,
  `changed_by` INT UNSIGNED,
  `ip_address` VARCHAR(45),
  `metadata` JSON,
  
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  INDEX `idx_order_history_order` (`order_id`),
  INDEX `idx_order_history_created` (`created_at`),
  INDEX `idx_order_history_new_status` (`new_status`),
  
  CONSTRAINT `fk_order_history_orders` FOREIGN KEY (`order_id`) 
    REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `wallets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `balance` BIGINT NOT NULL DEFAULT 0,
  
  -- NOTE: status - 0=inactive, 1=active, 2=frozen, 3=closed
  `status` TINYINT NOT NULL DEFAULT 1,
  
  `version` INT NOT NULL DEFAULT 0,
  
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_wallets_user` (`user_id`),
  CONSTRAINT `fk_wallets_users` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `wallet_id` INT NOT NULL,
  `amount` BIGINT NOT NULL,
  `before_balance` BIGINT NOT NULL,
  `after_balance` BIGINT NOT NULL,
  
  -- Type: 0=deposit, 1=withdraw, 2=purchase, 3=refund, 4=bonus
  `type` TINYINT NOT NULL,
  
  `ref_id` VARCHAR(100) DEFAULT NULL,
  `ref_type` VARCHAR(50) DEFAULT NULL,
  
  `description` VARCHAR(255) DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_wallet_trans_query` (`wallet_id`, `created_at`),
  INDEX `idx_wallet_trans_ref` (`ref_id`, `ref_type`),
  
  CONSTRAINT `fk_wallet_trans_wallets` FOREIGN KEY (`wallet_id`) 
    REFERENCES `wallets` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `payment_webhooks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  `order_id` INT NOT NULL,
  `webhook_id` VARCHAR(100) NOT NULL,
  `reference_code` VARCHAR(255) NULL,
  `gateway` VARCHAR(100),
  `status` VARCHAR(50),
  `processed_at` DATETIME(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_webhooks_order_id` (`order_id`),
  UNIQUE INDEX `uk_webhooks_webhook_id` (`webhook_id`),
  INDEX `idx_webhooks_ref_code` (`reference_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  
  -- Type: 0=order_status, 1=account_sold, 2=promotion, 3=system, 4=message
  `type` TINYINT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `data` JSON NULL,
  `action_url` VARCHAR(500) DEFAULT NULL,
  
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  
  `read_at` DATETIME(3) NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user_unread` (`user_id`, `is_read`, `created_at`),
  INDEX `idx_notifications_type` (`type`),
  
  CONSTRAINT `fk_notifications_users` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  
  `action` VARCHAR(100) NOT NULL,
  `method` VARCHAR(10) DEFAULT NULL,
  `path` VARCHAR(255) DEFAULT NULL,
  
  `payload` JSON DEFAULT NULL,
  `prev_state` JSON DEFAULT NULL,
  `new_state` JSON DEFAULT NULL,
  
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `status_code` INT DEFAULT NULL,
  `error_msg` TEXT DEFAULT NULL,
  `duration` INT DEFAULT NULL,
  
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `idx_audit_logs_user_created` (`user_id`, `created_at`),
  INDEX `idx_audit_logs_action` (`action`),
  INDEX `idx_audit_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (
    `name`, 
    `slug`, 
    `image`, 
    `description`, 
    `display_order`, 
    `status`, 
    `created_at`, 
    `updated_at`
) VALUES (
    'Play Together', 
    'play-together', 
    '',
    '', 
    1, 
    1, 
    NOW(3), 
    NOW(3)
);


SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS SIZE_MB,
  ENGINE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'tradeplay_db'
ORDER BY TABLE_NAME;

SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'tradeplay_db'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

SELECT 
  TABLE_NAME,
  INDEX_NAME,
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS,
  INDEX_TYPE,
  NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'tradeplay_db'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'tradeplay_db'
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;