-- =====================================================
-- Seed: 01_admin_user.sql
-- Descrição: Cria usuário administrador inicial
-- =====================================================

-- Inserir usuário admin (senha: Admin@123)
INSERT INTO users (id, name, email, password, role, is_active, email_verified, created_at)
VALUES (
    UUID(),
    'Administrador',
    'admin@sistema.com',
    '$2b$10$YourHashedPasswordHere', -- BCrypt hash de 'Admin@123' (gerar depois)
    'admin',
    TRUE,
    TRUE,
    NOW()
);

-- Inserir usuário gerente
INSERT INTO users (id, name, email, password, role, is_active, email_verified, created_at)
VALUES (
    UUID(),
    'Gerente de Estoque',
    'gerente@sistema.com',
    '$2b$10$YourHashedPasswordHere', -- BCrypt hash de 'Gerente@123'
    'manager',
    TRUE,
    TRUE,
    NOW()
);

-- Inserir usuário operador
INSERT INTO users (id, name, email, password, role, is_active, email_verified, created_at)
VALUES (
    UUID(),
    'Operador',
    'operador@sistema.com',
    '$2b$10$YourHashedPasswordHere', -- BCrypt hash de 'Operador@123'
    'operator',
    TRUE,
    TRUE,
    NOW()
);

-- Nota: Para gerar hashes BCrypt, use:
-- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123', 10));"