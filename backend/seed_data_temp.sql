USE inventory_db;

INSERT INTO users (name, email, password, role) VALUES 
('Administrador', 'admin@test.com', '\\\.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT INTO categories (name, description) VALUES 
('Eletronicos', 'Produtos eletronicos em geral');

INSERT INTO products (name, code, category_id, price, stock_quantity, min_stock)
SELECT 'Produto Teste', 'TEST001', id, 100.00, 20, 5 FROM categories WHERE name = 'Eletronicos';
