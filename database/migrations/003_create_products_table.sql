-- =====================================================
-- Migration: 003_create_products_table
-- Descrição: Cria a tabela de produtos
-- Data: 2024-01-01
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Identificação do produto
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(50) UNIQUE,
    sku VARCHAR(50) UNIQUE,
    
    -- Categoria
    category_id CHAR(36) NOT NULL,
    
    -- Descrição
    description TEXT,
    short_description VARCHAR(500),
    
    -- Preços e custos
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    profit_margin DECIMAL(5,2) GENERATED ALWAYS AS (
        (price - cost_price) / price * 100
    ) STORED,
    
    -- Estoque
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock INT DEFAULT 5 CHECK (min_stock >= 0),
    max_stock INT DEFAULT 100 CHECK (max_stock >= 0),
    
    -- Localização
    location VARCHAR(50),
    shelf VARCHAR(20),
    
    -- Controle
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Imagens
    image_url VARCHAR(500),
    image_alt VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Chaves estrangeiras
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_products_name (name),
    INDEX idx_products_code (code),
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_category (category_id),
    INDEX idx_products_stock (stock_quantity),
    INDEX idx_products_min_stock (min_stock),
    INDEX idx_products_active (is_active),
    
    -- Índice composto para consultas comuns
    INDEX idx_products_category_stock (category_id, stock_quantity),
    
    -- Fulltext para busca textual
    FULLTEXT INDEX ft_products_search (name, description, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE products COMMENT 'Tabela principal de produtos do estoque';