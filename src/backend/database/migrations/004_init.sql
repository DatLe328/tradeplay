-- =====================================================
-- TRADEPLAY DATABASE - PRODUCTION OPTIMIZED VERSION
-- =====================================================
-- Author: Database Schema Design
-- Date: 2026-01-16
-- Description: Complete database schema with optimization
-- 
-- =====================================================

-- Drop database if exists
DROP DATABASE IF EXISTS tradeplay_db;
CREATE DATABASE tradeplay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tradeplay_db;


-- =====================================================
-- CORE TABLES - USER & AUTHENTICATION
-- =====================================================

-- Users Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  
  -- NOTE 0=user, 1=admin
  `system_role` TINYINT NOT NULL DEFAULT 0,
  
  -- NOTE 0=inactive, 1=active, 2=banned
  `status` TINYINT NOT NULL DEFAULT 0,
  
  `deleted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_role` (`system_role`),
  INDEX `idx_status` (`status`),
  INDEX `idx_deleted_at` (`deleted_at`),
  UNIQUE INDEX `idx_phone` (`phone_number`),
  
  -- Check constraints 
  CONSTRAINT `chk_user_status` CHECK (`status` IN (0, 1, 2)),
  CONSTRAINT `chk_system_role` CHECK (`system_role` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Auths Table
DROP TABLE IF EXISTS `auths`;
CREATE TABLE `auths` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  
  -- NOTE: auth_type
  -- 0=email/password, 1=google
  `auth_type` TINYINT NOT NULL DEFAULT 0,
  
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `salt` VARCHAR(50) DEFAULT NULL,
  `google_id` VARCHAR(100) DEFAULT NULL,
  
  -- NOTE: 0=unverified, 1=verified, 2=suspended
  `status` TINYINT NOT NULL DEFAULT 0,
  
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_auth_email_type` (`email`, `auth_type`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_google_id` (`google_id`),
  INDEX `idx_status` (`status`),
  
  CONSTRAINT `chk_auth_type` CHECK (`auth_type` IN (0, 1)),
  CONSTRAINT `chk_auth_status` CHECK (`status` IN (0, 1, 2)),
  CONSTRAINT `fk_auths_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- User Tokens - JWT/Refresh tokens
DROP TABLE IF EXISTS `user_tokens`;
CREATE TABLE `user_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_id` VARCHAR(50) NOT NULL,
  `token` TEXT NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_id` (`token_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_expires` (`expires_at`),
  INDEX `idx_revoked` (`is_revoked`),
  
  CONSTRAINT `fk_tokens_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Verify Codes - Email/Phone verification
DROP TABLE IF EXISTS `verify_codes`;
CREATE TABLE `verify_codes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  
  -- NOTE: type - 0=email_verify, 1=password_reset, 2=2fa, 3=phone_verify
  `type` TINYINT NOT NULL,
  
  `expired_at` DATETIME NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_verify_query` (`email`, `type`, `is_used`, `expired_at`),
  INDEX `idx_code` (`code`),
  
  CONSTRAINT `chk_verify_type` CHECK (`type` IN (0, 1, 2, 3))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- ACCOUNTS & PRODUCTS
-- =====================================================

-- Accounts Table - Gaming accounts for sale
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` TIMESTAMP NULL,
  
  `owner_id` INT NOT NULL,
  `game_name` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  
  `price` DECIMAL(20,2) NOT NULL,
  `original_price` DECIMAL(20,2) NULL,
  
  `thumbnail` VARCHAR(500) NULL,
  `images` JSON NULL,
  `attributes` JSON NULL,  -- Game-specific attributes (level, rank, champions, etc.)
  `features` JSON NULL,    -- Highlighted features

  -- NOTE: 0=draft, 1=available, 2=reserved, 3=sold, 4=deleted
  `status` TINYINT NOT NULL DEFAULT 0,
  
  `view_count` INT UNSIGNED DEFAULT 0,  -- Denormalized for performance
  
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_game_name` (`game_name`),
  INDEX `idx_status` (`status`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_created_at` (`created_at`),
  
  INDEX `idx_game_status` (`game_name`, `status`),
  INDEX `idx_status_price` (`status`, `price`),
  INDEX `idx_game_price_status` (`game_name`, `price`, `status`),
  INDEX `idx_owner_status` (`owner_id`, `status`),
  
  FULLTEXT INDEX `ft_title_desc` (`title`, `description`),
  
  CONSTRAINT `chk_account_status` CHECK (`status` IN (0, 1, 2, 3, 4)),
  CONSTRAINT `chk_account_price` CHECK (`price` >= 0),
  CONSTRAINT `chk_original_price` CHECK (`original_price` IS NULL OR `original_price` >= `price`),
  CONSTRAINT `fk_accounts_owner` FOREIGN KEY (`owner_id`) 
    REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Account Stats - Cached statistics
-- DROP TABLE IF EXISTS `account_stats`;
-- CREATE TABLE `account_stats` (
--   `account_id` INT PRIMARY KEY,
--   `view_count` INT UNSIGNED DEFAULT 0,
--   `favorite_count` INT UNSIGNED DEFAULT 0,
--   `inquiry_count` INT UNSIGNED DEFAULT 0,
--   `share_count` INT UNSIGNED DEFAULT 0,
--   `last_viewed_at` TIMESTAMP NULL,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
--   INDEX `idx_view_count` (`view_count`),
--   INDEX `idx_favorite_count` (`favorite_count`),
--   INDEX `idx_updated` (`updated_at`),
  
--   CONSTRAINT `fk_account_stats` FOREIGN KEY (`account_id`) 
--     REFERENCES `accounts` (`id`) ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Account History - Audit trail
-- DROP TABLE IF EXISTS `account_history`;
-- CREATE TABLE `account_history` (
--   `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--   `account_id` INT NOT NULL,
--   `action` VARCHAR(50) NOT NULL,  -- created, updated, status_changed, owner_changed
--   `old_status` TINYINT,
--   `new_status` TINYINT,
--   `old_owner_id` INT,
--   `new_owner_id` INT,
--   `old_price` DECIMAL(20,2),
--   `new_price` DECIMAL(20,2),
--   `changed_by` INT,
--   `reason` VARCHAR(255),
--   `metadata` JSON,
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
--   INDEX `idx_account` (`account_id`),
--   INDEX `idx_action` (`action`),
--   INDEX `idx_created` (`created_at`),
--   INDEX `idx_changed_by` (`changed_by`),
  
--   CONSTRAINT `fk_account_history` FOREIGN KEY (`account_id`) 
--     REFERENCES `accounts` (`id`) ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- ORDERS & TRANSACTIONS
-- =====================================================

-- Orders Table
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  `user_id` INT NOT NULL,
  `account_id` INT NULL,
  
  `total_price` DECIMAL(20,2) NOT NULL,
  
  -- NOTE: 0=pending, 1=paid, 2=completed, 3=cancelled, 4=refunded
  `status` TINYINT NOT NULL DEFAULT 0,
  
  -- NOTE: 0=buy, 1=deposit
  `type` TINYINT NOT NULL DEFAULT 0,
  
  `payment_method` VARCHAR(50),  -- bank_transfer, wallet, momo, vnpay
  `payment_ref` VARCHAR(255),     -- Reference từ payment gateway
  `notes` TEXT,
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_account_id` (`account_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_payment_ref` (`payment_ref`),
  
  -- Composite indexes
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_status_type` (`status`, `type`),
  INDEX `idx_user_created` (`user_id`, `created_at`),
  
  CONSTRAINT `chk_order_status` CHECK (`status` IN (0, 1, 2, 3, 4)),
  CONSTRAINT `chk_order_type` CHECK (`type` IN (0, 1, 2)),
  CONSTRAINT `chk_order_price` CHECK (`total_price` >= 0),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_orders_account` FOREIGN KEY (`account_id`) 
    REFERENCES `accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Order History - Status tracking
DROP TABLE IF EXISTS `order_history`;
CREATE TABLE `order_history` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `old_status` TINYINT,
  `new_status` TINYINT NOT NULL,
  `note` TEXT,
  `changed_by` INT,
  `ip_address` VARCHAR(45),
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_order` (`order_id`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_new_status` (`new_status`),
  
  CONSTRAINT `fk_order_history` FOREIGN KEY (`order_id`) 
    REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- WALLET & PAYMENT SYSTEM
-- =====================================================

-- Wallets Table
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `balance` DECIMAL(20,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) DEFAULT 'VND',
  
  -- NOTE: status - 0=inactive, 1=active, 2=frozen, 3=closed
  `status` TINYINT NOT NULL DEFAULT 1,
  
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_currency` (`user_id`, `currency`),
  INDEX `idx_status` (`status`),
  INDEX `idx_balance` (`balance`),
  
  CONSTRAINT `chk_wallet_status` CHECK (`status` IN (0, 1, 2, 3)),
  CONSTRAINT `chk_wallet_balance` CHECK (`balance` >= 0),
  CONSTRAINT `fk_wallets_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Wallet Transactions
drop table if exists `wallet_transactions`;
create table `wallet_transactions` (
  `id` bigint unsigned not null auto_increment,
  `wallet_id` bigint unsigned not null,
  `amount` decimal(20,2) not null,
  `before_balance` decimal(20,2) not null,
  `after_balance` decimal(20,2) not null,
  
  -- note: 0=deposit, 1=withdraw, 2=purchase, 3=refund, 4=bonus
  `type` tinyint not null,
  
  `ref_id` varchar(100) default null,  -- order_id, bank_transaction_id, etc.
  `ref_type` varchar(50) default null,  -- order, bank_transaction, system
  `description` varchar(255) default null,
  `metadata` json,
  `created_at` timestamp null default current_timestamp,
  `updated_at` timestamp null default current_timestamp on update current_timestamp,
  
  primary key (`id`),
  index `idx_wallet` (`wallet_id`),
  index `idx_type` (`type`),
  index `idx_ref_id` (`ref_id`),
  index `idx_created_at` (`created_at`),
  index `idx_wallet_created` (`wallet_id`, `created_at`),
  index `idx_type_created` (`type`, `created_at`),
  
  constraint `fk_wallet_trans_wallet` foreign key (`wallet_id`) 
    references `wallets` (`id`) on delete cascade
) engine=innodb default charset=utf8mb4 collate=utf8mb4_unicode_ci;


-- Bank Transactions - Webhook từ bank/payment gateway
DROP TABLE IF EXISTS `bank_transactions`;
CREATE TABLE `bank_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Gateway info
  `gateway` VARCHAR(50) NOT NULL,  -- vcb, mbbank, vietcombank, momo, vnpay
  `reference_number` VARCHAR(255) NOT NULL,
  `transaction_date` TIMESTAMP NOT NULL,
  
  -- Account info
  `account_number` VARCHAR(100) NOT NULL,
  `sub_account` VARCHAR(250) DEFAULT NULL,
  `accumulated` DECIMAL(20,2) DEFAULT 0.00,
  
  -- Transaction details
  `amount` DECIMAL(20,2) NOT NULL,
  
  -- NOTE: direction - 0=incoming/credit, 1=outgoing/debit
  `direction` TINYINT NOT NULL,
  
  `code` VARCHAR(100) DEFAULT NULL,
  `transaction_content` TEXT DEFAULT NULL,
  `raw_payload` JSON NOT NULL,
  
  -- Processing status
  -- NOTE: status - 0=pending, 1=processed/completed, 2=failed, 3=reconciled
  `status` TINYINT NOT NULL DEFAULT 0,
  
  `error_message` TEXT DEFAULT NULL,
  `related_order_id` INT DEFAULT NULL,
  `related_user_id` INT DEFAULT NULL,
  
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_gateway_ref` (`gateway`, `reference_number`),
  INDEX `idx_account_date` (`account_number`, `transaction_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_code` (`code`),
  INDEX `idx_amount` (`amount`),
  INDEX `idx_related_order` (`related_order_id`),
  INDEX `idx_related_user` (`related_user_id`),
  INDEX `idx_status_date` (`status`, `transaction_date`),
  INDEX `idx_created_at` (`created_at`),
  
  CONSTRAINT `chk_bank_direction` CHECK (`direction` IN (0, 1)),
  CONSTRAINT `chk_bank_status` CHECK (`status` IN (0, 1, 2, 3)),
  CONSTRAINT `chk_bank_amount` CHECK (`amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- USER ENGAGEMENT
-- =====================================================

-- User Favorites
DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `account_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY `uniq_user_account` (`user_id`, `account_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_account` (`account_id`),
  INDEX `idx_created` (`created_at`),
  
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_account` FOREIGN KEY (`account_id`) 
    REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  
  -- NOTE: type - order_status, account_sold, promotion, system, message
  `type` VARCHAR(50) NOT NULL,
  
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `data` JSON,
  `action_url` VARCHAR(500),
  
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_user_created` (`user_id`, `created_at`),
  INDEX `idx_user_unread` (`user_id`, `is_read`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created` (`created_at`),
  
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- AUDIT & LOGGING
-- =====================================================

-- User Activity Log
DROP TABLE IF EXISTS `user_activity_log`;
CREATE TABLE `user_activity_log` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  
  -- NOTE: action - login, logout, update_profile, create_listing, etc.
  `action` VARCHAR(100) NOT NULL,
  
  `ip_address` VARCHAR(45),
  `user_agent` VARCHAR(255),
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_user_created` (`user_id`, `created_at`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_ip` (`ip_address`),
  
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- System Config - Dynamic configuration
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT NOT NULL,
  `type` VARCHAR(20) DEFAULT 'string',  -- string, number, boolean, json
  `description` VARCHAR(255),
  `is_public` TINYINT(1) DEFAULT 0,
  `category` VARCHAR(50),
  `updated_by` INT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_is_public` (`is_public`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- VERIFICATION & HELPER QUERIES
-- =====================================================

-- Verify all tables created
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS SIZE_MB,
  ENGINE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'tradeplay_db'
ORDER BY TABLE_NAME;

-- Verify all foreign keys
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'tradeplay_db'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

-- Verify all indexes
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

-- Verify all constraints
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'tradeplay'
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;