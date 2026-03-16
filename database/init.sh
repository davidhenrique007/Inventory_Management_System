#!/bin/bash

echo "🚀 Inicializando banco de dados Inventory Management"
echo "=================================================="

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Subir containers
echo "📦 Subindo containers..."
docker compose -f docker/docker-compose.yml up -d

# Aguardar MySQL ficar pronto
echo "⏳ Aguardando MySQL iniciar..."
sleep 10

# Executar migrations (se necessário)
echo "🔄 Executando migrations..."
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/migrations/001_create_users_table.sql
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/migrations/002_create_categories_table.sql
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/migrations/003_create_products_table.sql
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/migrations/004_create_movements_table.sql
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/migrations/005_create_triggers.sql

# Executar seeds
echo "🌱 Inserindo dados iniciais..."
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/seeds/01_admin_user.sql
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/seeds/02_categories.sql
docker exec -i inventory_mysql mysql -u root -proot123 inventory_db < database/seeds/03_sample_products.sql

echo "✅ Banco de dados inicializado com sucesso!"
echo ""
echo "📊 Acessos:"
echo "   - MySQL: localhost:3306"
echo "   - phpMyAdmin: http://localhost:8080"
echo "   - Adminer: http://localhost:8081"
echo ""
echo "🔑 Credenciais:"
echo "   - Usuário: root / root123"
echo "   - Banco: inventory_db"