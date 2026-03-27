// scripts/seed.js
// Script para popular o banco com dados iniciais

const { sequelize, User, Category, Product } = require('../src/models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco!');

    // Criar usuário admin
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        name: 'Administrador',
        email: 'admin@test.com',
        password: await bcrypt.hash('123456', 10),
        role: 'admin'
      }
    });
    console.log(created ? '✅ Usuário admin criado!' : '⚠️ Usuário admin já existe!');

    // Criar categoria
    const [category, catCreated] = await Category.findOrCreate({
      where: { name: 'Eletronicos' },
      defaults: {
        name: 'Eletronicos',
        description: 'Produtos eletronicos em geral'
      }
    });
    console.log(catCreated ? '✅ Categoria criada!' : '⚠️ Categoria já existe!');

    // Criar produto
    const [product, prodCreated] = await Product.findOrCreate({
      where: { code: 'TEST001' },
      defaults: {
        name: 'Produto Teste',
        code: 'TEST001',
        categoryId: category.id,
        price: 100.00,
        stockQuantity: 20,
        minStock: 5
      }
    });
    console.log(prodCreated ? '✅ Produto criado!' : '⚠️ Produto já existe!');
    console.log('   Estoque: ' + product.stockQuantity);

    console.log('🎉 Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
