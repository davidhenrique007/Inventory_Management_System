-- =====================================================
-- Seed: 02_categories.sql
-- Descrição: Categorias iniciais do sistema
-- =====================================================

-- Inserir categorias principais
INSERT INTO categories (id, name, slug, description, sort_order, created_at) VALUES
(
    UUID(),
    'Eletrônicos',
    'eletronicos',
    'Produtos eletrônicos em geral, incluindo áudio, vídeo e gadgets',
    1,
    NOW()
),
(
    UUID(),
    'Informática',
    'informatica',
    'Computadores, periféricos e acessórios de informática',
    2,
    NOW()
),
(
    UUID(),
    'Escritório',
    'escritorio',
    'Materiais e suprimentos para escritório',
    3,
    NOW()
),
(
    UUID(),
    'Telefonia',
    'telefonia',
    'Smartphones, acessórios e equipamentos de telefonia',
    4,
    NOW()
),
(
    UUID(),
    'Áudio e Vídeo',
    'audio-video',
    'Equipamentos de áudio, vídeo e entretenimento',
    5,
    NOW()
);

-- Inserir subcategorias (vinculadas às principais)
-- Eletrônicos -> Subcategorias
INSERT INTO categories (id, name, slug, description, parent_id, sort_order, created_at)
SELECT 
    UUID(),
    'TVs',
    'tvs',
    'Televisores e acessórios',
    id,
    1,
    NOW()
FROM categories WHERE slug = 'eletronicos';

INSERT INTO categories (id, name, slug, description, parent_id, sort_order, created_at)
SELECT 
    UUID(),
    'Home Theater',
    'home-theater',
    'Sistemas de som e home theater',
    id,
    2,
    NOW()
FROM categories WHERE slug = 'eletronicos';

-- Informática -> Subcategorias
INSERT INTO categories (id, name, slug, description, parent_id, sort_order, created_at)
SELECT 
    UUID(),
    'Computadores',
    'computadores',
    'Desktops e notebooks',
    id,
    1,
    NOW()
FROM categories WHERE slug = 'informatica';

INSERT INTO categories (id, name, slug, description, parent_id, sort_order, created_at)
SELECT 
    UUID(),
    'Periféricos',
    'perifericos',
    'Mouses, teclados e outros periféricos',
    id,
    2,
    NOW()
FROM categories WHERE slug = 'informatica';