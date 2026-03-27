// scripts/seed.js
// Script para popular o banco com dados iniciais

const { sequelize, User, Category, Product } = require('../src/models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco!');

    // Criar usuário admin
    const adminExists = await User.findOne({ where: { email: 'admin@test.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Administrador',
        email: 'admin@test.com',
        password: await bcrypt.hash('123456', 10),
        role: 'admin'
      });
      console.log('✅ Usuário admin criado!');
    } else {
      console.log('⚠️ Usuário admin já existe!');
    }

    // Criar categoria
    const categoryExists = await Category.findOne({ where: { name: 'Eletronicos' } });
    if (!categoryExists) {
      const category = await Category.create({
        name: 'Eletronicos',
        description: 'Produtos eletronicos em geral'
      });
      console.log('✅ Categoria criada!');

      // Criar produto
      await Product.create({
        name: 'Produto Teste',
        code: 'TEST001',
        categoryId: category.id,
        price: 100.00,
        stockQuantity: 20,
        minStock: 5
      });
      console.log('✅ Produto criado!');
    } else {
      console.log('⚠️ Categoria já existe!');
    }

    console.log('🎉 Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
