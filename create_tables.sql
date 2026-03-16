-- Criar e usar banco
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- ============================================
-- TABELA DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'operator') DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE CATEGORIAS
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(50) UNIQUE,
    category_id CHAR(36),
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 5,
    max_stock INT DEFAULT 100,
    location VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_products_code (code),
    INDEX idx_products_category (category_id),
    INDEX idx_products_stock (stock_quantity)
);

-- ============================================
-- TABELA DE MOVIMENTAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS movements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    previous_stock INT NOT NULL,
    current_stock INT NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_movements_product (product_id),
    INDEX idx_movements_date (created_at),
    INDEX idx_movements_type (type)
);

-- Mostrar tabelas criadas
SELECT '✅ TABELAS CRIADAS COM SUCESSO!' as '';

SHOW TABLES;

SELECT '📋 ESTRUTURA DAS TABELAS:' as '';
SELECT 
    TABLE_NAME as 'Tabela',
    COLUMN_NAME as 'Coluna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Nullable',
    COLUMN_KEY as 'Chave'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'inventory_db'
ORDER BY TABLE_NAME, ORDINAL_POSITION;
