-- Docker initialization script for GLEENT Affiliate Management
-- This file runs automatically when the MySQL container is first created
-- The database 'gleen_affiliate' is already created by docker-compose

USE gleen_affiliate;

-- Users table (for both admin and affiliate partners)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20),
    role ENUM('admin', 'affiliate') NOT NULL DEFAULT 'affiliate',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_code_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_email_verified (email_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partners table (affiliate partners)
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    status ENUM('pending', 'active', 'inactive', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
    id VARCHAR(36) PRIMARY KEY,
    partner_id VARCHAR(36),
    original_url TEXT NOT NULL,
    link_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(100) DEFAULT 'direct',
    is_general BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    earnings DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    INDEX idx_partner_id (partner_id),
    INDEX idx_link_code (link_code),
    INDEX idx_is_general (is_general),
    INDEX idx_is_enabled (is_enabled),
    INDEX idx_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Link clicks tracking table (with referrer domain tracking)
-- Note: partner_id is nullable to support general links which don't have a specific partner
CREATE TABLE IF NOT EXISTS link_clicks (
    id VARCHAR(36) PRIMARY KEY,
    link_id VARCHAR(36),
    partner_id VARCHAR(36),
    affiliate_id VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    referrer_domain VARCHAR(255),
    page_url TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id) ON DELETE SET NULL,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    INDEX idx_link_id (link_id),
    INDEX idx_partner_id (partner_id),
    INDEX idx_affiliate_id (affiliate_id),
    INDEX idx_clicked_at (clicked_at),
    INDEX idx_referrer_domain (referrer_domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo requests table (form submissions / conversions)
CREATE TABLE IF NOT EXISTS demo_requests (
    id VARCHAR(36) PRIMARY KEY,
    partner_id VARCHAR(36),
    affiliate_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    referrer TEXT,
    referrer_domain VARCHAR(255),
    source_url TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    INDEX idx_partner_id (partner_id),
    INDEX idx_affiliate_id (affiliate_id),
    INDEX idx_requested_at (requested_at),
    INDEX idx_referrer_domain (referrer_domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partner earnings table (external API / curl – add earnings per affiliate link)
CREATE TABLE IF NOT EXISTS partner_earnings (
    id VARCHAR(36) PRIMARY KEY,
    link_id VARCHAR(36) NOT NULL,
    partner_id VARCHAR(36) NOT NULL,
    affiliate_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    earned_at TIMESTAMP NOT NULL,
    client_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    INDEX idx_link_id (link_id),
    INDEX idx_partner_id (partner_id),
    INDEX idx_affiliate_id (affiliate_id),
    INDEX idx_earned_at (earned_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Keys table for external integrations (demo-form-app)
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    key_value VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    INDEX idx_key_value (key_value),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default API key for demo-form-app
INSERT INTO api_keys (id, key_value, name, is_active) VALUES 
(UUID(), 'aff_live_key_2026_xK9mP2vL8nQ4wR7j', 'Demo Form App - Development', TRUE);
