-- =====================================================
-- Seed: 03_sample_products.sql
-- Descrição: Produtos de exemplo para testes
-- =====================================================

-- Primeiro, pegar IDs das categorias
SET @eletronicos_id = (SELECT id FROM categories WHERE slug = 'eletronicos' AND parent_id IS NULL);
SET @informatica_id = (SELECT id FROM categories WHERE slug = 'informatica' AND parent_id IS NULL);
SET @escritorio_id = (SELECT id FROM categories WHERE slug = 'escritorio' AND parent_id IS NULL);
SET @tvs_id = (SELECT id FROM categories WHERE slug = 'tvs');
SET @computadores_id = (SELECT id FROM categories WHERE slug = 'computadores');
SET @perifericos_id = (SELECT id FROM categories WHERE slug = 'perifericos');

-- Inserir produtos
INSERT INTO products (
    id, name, code, barcode, sku, category_id, description, 
    price, cost_price, stock_quantity, min_stock, max_stock, location,
    is_active, created_at
) VALUES
-- Produtos de Eletrônicos
(
    UUID(),
    'Smart TV 50" 4K',
    'TV50-4K-001',
    '7891234560011',
    'SKU-TV50-001',
    @tvs_id,
    'Smart TV LED 50" 4K com Wi-Fi, Bluetooth e sistema operacional',
    2899.90,
    2100.00,
    15,
    5,
    50,
    'A-01-01',
    TRUE,
    NOW()
),
(
    UUID(),
    'Home Theater 5.1',
    'HT51-002',
    '7891234560022',
    'SKU-HT-002',
    (SELECT id FROM categories WHERE slug = 'home-theater'),
    'Sistema Home Theater 5.1 com Bluetooth e entradas HDMI',
    1299.90,
    950.00,
    8,
    3,
    30,
    'A-02-01',
    TRUE,
    NOW()
),

-- Produtos de Informática
(
    UUID(),
    'Notebook Pro 16GB',
    'NB-16GB-001',
    '7891234560033',
    'SKU-NB-001',
    @computadores_id,
    'Notebook com processador i7, 16GB RAM, SSD 512GB',
    5299.90,
    4200.00,
    5,
    2,
    20,
    'B-01-01',
    TRUE,
    NOW()
),
(
    UUID(),
    'Mouse Gamer',
    'MOUSE-GM-001',
    '7891234560044',
    'SKU-MOUSE-001',
    @perifericos_id,
    'Mouse Gamer com 7 botões, RGB e 16000 DPI',
    159.90,
    85.00,
    42,
    10,
    100,
    'B-02-01',
    TRUE,
    NOW()
),
(
    UUID(),
    'Teclado Mecânico',
    'TEC-MEC-001',
    '7891234560055',
    'SKU-TEC-001',
    @perifericos_id,
    'Teclado mecânico RGB com switches blue',
    289.90,
    180.00,
    28,
    10,
    80,
    'B-02-02',
    TRUE,
    NOW()
),

-- Produtos de Escritório
(
    UUID(),
    'Cadeira Ergonomica',
    'CADE-ERG-001',
    '7891234560066',
    'SKU-CADE-001',
    @escritorio_id,
    'Cadeira ergonômica com ajuste de altura e braços',
    899.90,
    550.00,
    12,
    5,
    40,
    'C-01-01',
    TRUE,
    NOW()
),
(
    UUID(),
    'Mesa Digital',
    'MESA-DIG-001',
    '7891234560077',
    'SKU-MESA-001',
    @escritorio_id,
    'Mesa digital para escritório com ajuste de altura',
    459.90,
    280.00,
    7,
    3,
    25,
    'C-01-02',
    TRUE,
    NOW()
);

-- Atualizar sequence de estoque
UPDATE products SET stock_quantity = stock_quantity WHERE stock_quantity > 0;