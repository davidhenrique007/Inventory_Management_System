-- =====================================================
-- QUERIES OTIMIZADAS PARA DASHBOARD
-- =====================================================

-- 1. Dashboard Summary
-- Total de produtos, valor do estoque, etc
SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = 1 AND deleted_at IS NULL) AS total_products,
    (SELECT COUNT(*) FROM categories WHERE deleted_at IS NULL) AS total_categories,
    (SELECT SUM(stock_quantity) FROM products WHERE is_active = 1 AND deleted_at IS NULL) AS total_stock_quantity,
    (SELECT SUM(price * stock_quantity) FROM products WHERE is_active = 1 AND deleted_at IS NULL) AS total_stock_value,
    (SELECT COUNT(*) FROM products WHERE is_active = 1 AND stock_quantity <= min_stock AND deleted_at IS NULL) AS low_stock_count,
    (SELECT COUNT(*) FROM products WHERE is_active = 1 AND stock_quantity = 0 AND deleted_at IS NULL) AS out_of_stock_count,
    (SELECT COUNT(*) FROM movements WHERE DATE(created_at) = CURDATE()) AS movements_today,
    (SELECT COUNT(*) FROM movements WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) AS movements_this_month;

-- 2. Produtos com Estoque Baixo (com categoria)
SELECT 
    p.id,
    p.name,
    p.code,
    p.price,
    p.stock_quantity,
    p.min_stock,
    c.name AS category_name,
    (p.stock_quantity - p.min_stock) AS difference,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'CRITICAL'
        ELSE 'WARNING'
    END AS status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = 1 
    AND p.deleted_at IS NULL
    AND p.stock_quantity <= p.min_stock
ORDER BY p.stock_quantity ASC
LIMIT ? OFFSET ?;

-- 3. Últimas Movimentações
SELECT 
    m.id,
    m.type,
    m.quantity,
    m.previous_stock,
    m.current_stock,
    m.unit_price,
    m.total_price,
    m.notes,
    m.created_at,
    p.name AS product_name,
    p.code AS product_code,
    u.name AS user_name
FROM movements m
LEFT JOIN products p ON m.product_id = p.id
LEFT JOIN users u ON m.created_by = u.id
WHERE m.deleted_at IS NULL
ORDER BY m.created_at DESC
LIMIT ?;

-- 4. Resumo de Movimentações por Dia (últimos 7 dias)
SELECT 
    DATE(created_at) AS date,
    type,
    SUM(quantity) AS total_quantity,
    SUM(total_price) AS total_value,
    COUNT(*) AS total_movements
FROM movements
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(created_at), type
ORDER BY date ASC;

-- 5. Top 10 Produtos Mais Movimentados
SELECT 
    p.id,
    p.name,
    p.code,
    COUNT(m.id) AS movement_count,
    SUM(m.quantity) AS total_moved,
    SUM(m.total_price) AS total_value
FROM products p
INNER JOIN movements m ON p.id = m.product_id
WHERE p.is_active = 1 
    AND p.deleted_at IS NULL
    AND m.deleted_at IS NULL
GROUP BY p.id, p.name, p.code
ORDER BY total_moved DESC
LIMIT 10;