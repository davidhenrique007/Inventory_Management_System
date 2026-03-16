-- =====================================================
-- Migration: 001_create_users_table
-- Descrição: Cria a tabela de usuários do sistema
-- Data: 2024-01-01
-- Autor: Sistema
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    -- Identificador único do usuário (UUID para maior segurança)
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Dados pessoais
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    
    -- Controle de acesso
    role ENUM('admin', 'manager', 'operator') NOT NULL DEFAULT 'operator',
    
    -- Status da conta
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL, -- Soft delete
    
    -- Índices
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger para atualizar updated_at automaticamente
DELIMITER //
CREATE TRIGGER users_before_update 
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Comentários da tabela
ALTER TABLE users COMMENT 'Tabela de usuários do sistema de gestão de estoque';