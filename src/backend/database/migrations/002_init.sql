USE tradeplay;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  system_role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  status TINYINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_role (system_role),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `auths`;
CREATE TABLE `auths` (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  auth_type ENUM('email_password', 'facebook', 'google') NOT NULL DEFAULT 'email_password',
  email VARCHAR(50) NOT NULL,
  password VARCHAR(255) DEFAULT NULL,
  salt VARCHAR(50) DEFAULT NULL,
  facebook_id VARCHAR(50) DEFAULT NULL,
  google_id VARCHAR(50) DEFAULT NULL,
  status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_auth_email_type (email, auth_type),
  KEY idx_user_id (user_id),
  KEY idx_fb_id (facebook_id),
  KEY idx_gg_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `accounts` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `created_at` datetime(3) NULL,
  `updated_at` datetime(3) NULL,
  
  `owner_id` int NOT NULL,
  
  `game_name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  
  `price` double NOT NULL,
  `original_price` double NULL,
  
  `thumbnail` varchar(500) NULL,
  `images` json NULL,
  
  `rank` varchar(100) NULL,
  `level` int NULL,
  `server` varchar(100) NULL,

  `attributes` json null ,
  
  `features` json NULL,
  
  `status` ENUM('available', 'reserved', 'sold', 'deleted') DEFAULT 'available',
  
  INDEX `idx_owner_id` (`owner_id`)
) AUTO_INCREMENT = 100000;

CREATE TABLE `orders` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `created_at` datetime(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  `user_id` int NOT NULL,
  `account_id` int NOT NULL,

  `total_price` double NOT NULL,
  
  `status` ENUM('pending', 'paid', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  
  INDEX `idx_orders_user_id` (`user_id`),
  INDEX `idx_orders_account_id` (`account_id`)
);

CREATE TABLE IF NOT EXISTS verify_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  email VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL,

  type ENUM('register', 'forgot_password') NOT NULL,

  expired_at DATETIME NOT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  INDEX idx_verify_codes_email (email),
  INDEX idx_verify_codes_code (code),
  INDEX idx_verify_codes_type (type),
  INDEX idx_verify_codes_expired_at (expired_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_id` varchar(50) NOT NULL,
  `token` text NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_id` (`token_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `bank_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `gateway` VARCHAR(50) NOT NULL,
    `reference_number` VARCHAR(255) NOT NULL,
    `transaction_date` TIMESTAMP NOT NULL,
    `account_number` VARCHAR(100) NOT NULL,
    `sub_account` VARCHAR(250) DEFAULT NULL,
	`accumulated` DECIMAL(20,2) DEFAULT 0.00,
    `amount` DECIMAL(20,2) NOT NULL,
    `direction` ENUM('IN','OUT') NOT NULL,
    `code` VARCHAR(100) DEFAULT NULL,
    `transaction_content` TEXT DEFAULT NULL,
    `raw_payload` JSON NOT NULL,
    
    `status` ENUM('PENDING', 'PROCESSED', 'ERROR', 'IGNORED') NOT NULL DEFAULT 'PENDING',
    `error_message` TEXT DEFAULT NULL,
    `related_order_id` BIGINT UNSIGNED DEFAULT NULL,
    
	`created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY uniq_gateway_ref (`gateway`, `reference_number`),
    KEY idx_account_date (`account_number`, `transaction_date`),
    KEY idx_code (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `wallets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `balance` DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(10) DEFAULT 'VND',
    `status` TINYINT NOT NULL DEFAULT 1, 
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_user_currency` (`user_id`, `currency`),
    CONSTRAINT `fk_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `wallet_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `wallet_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(20,2) NOT NULL,
    `before_balance` DECIMAL(20,2) NOT NULL,
    `after_balance` DECIMAL(20,2) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `ref_id` VARCHAR(100) DEFAULT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_wallet` (`wallet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;