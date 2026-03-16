-- =====================================================
-- Migration: 004_create_movements_table
-- Descrição: Cria a tabela de movimentações de estoque
-- Data: 2024-01-01
-- =====================================================

CREATE TABLE IF NOT EXISTS movements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Identificação da movimentação
    movement_number VARCHAR(50) NOT NULL UNIQUE,
    
    -- Produto movimentado
    product_id CHAR(36) NOT NULL,
    
    -- Tipo de movimento
    type ENUM('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER') NOT NULL,
    subtype VARCHAR(50), -- 'PURCHASE', 'SALE', 'LOSS', 'COUNT'
    
    -- Quantidades
    quantity INT NOT NULL CHECK (quantity != 0),
    previous_stock INT NOT NULL,
    current_stock INT NOT NULL,
    
    -- Valores
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (
        quantity * unit_price
    ) STORED,
    
    -- Datas
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Referências
    created_by CHAR(36) NOT NULL,
    reference_id VARCHAR(50), -- Número da nota fiscal, pedido, etc
    reference_type VARCHAR(50), -- 'INVOICE', 'ORDER', 'COUNT'
    
    -- Observações
    notes TEXT,
    
    -- Controle
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    
    -- Chaves estrangeiras
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_movements_product (product_id),
    INDEX idx_movements_date (movement_date),
    INDEX idx_movements_type (type),
    INDEX idx_movements_created_by (created_by),
    INDEX idx_movements_reference (reference_id, reference_type),
    
    -- Índice composto para relatórios
    INDEX idx_movements_product_date (product_id, movement_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE movements COMMENT 'Tabela de movimentações de estoque';