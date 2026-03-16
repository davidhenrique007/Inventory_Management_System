-- =====================================================
-- Índices de Performance para Consultas Frequentes
-- =====================================================

-- Índices para busca de produtos
CREATE INDEX idx_products_search 
ON products (name, code, barcode) 
COMMENT 'Índice para busca rápida de produtos';

-- Índice para relatório de estoque baixo
CREATE INDEX idx_low_stock 
ON products (min_stock, stock_quantity) 
COMMENT 'Índice para identificar produtos com estoque baixo';

-- Índice para dashboard de movimentos
CREATE INDEX idx_movements_dashboard 
ON movements (movement_date, type, quantity) 
COMMENT 'Índice para consultas do dashboard';

-- Índice para análise de vendas por período
CREATE INDEX idx_movements_sales_analysis 
ON movements (product_id, movement_date, type, quantity) 
COMMENT 'Índice para análise de vendas';

-- Índice para relatórios financeiros
CREATE INDEX idx_movements_financial 
ON movements (movement_date, type, unit_price) 
COMMENT 'Índice para relatórios financeiros';

-- Índice para histórico de usuários
CREATE INDEX idx_movements_user_history 
ON movements (created_by, movement_date) 
COMMENT 'Índice para histórico por usuário';

-- Índice para busca de produtos por categoria e preço
CREATE INDEX idx_products_category_price 
ON products (category_id, price) 
COMMENT 'Índice para filtros de categoria e preço';