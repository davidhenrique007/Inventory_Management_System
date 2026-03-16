-- =====================================================
-- Migration: 002_create_categories_table
-- Descrição: Cria a tabela de categorias de produtos
-- Data: 2024-01-01
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Dados da categoria
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Hierarquia de categorias (para subcategorias)
    parent_id CHAR(36) NULL,
    
    -- Controle
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Chave estrangeira
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_categories_name (name),
    INDEX idx_categories_slug (slug),
    INDEX idx_categories_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE categories COMMENT 'Tabela de categorias para organização dos produtos';