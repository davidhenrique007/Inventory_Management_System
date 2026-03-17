jest.setTimeout(30000);

const { sequelize } = require('../../config/database');
const Category = require('../../models/Category')(sequelize, sequelize.Sequelize);

describe('🧪 Model Category', () => {
  
  beforeAll(async () => {
    // Sincronizar sem force para não recriar tudo
    await sequelize.sync({ alter: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    await Category.destroy({ where: {}, force: true });
  });

  test('Deve criar uma categoria válida', async () => {
    const category = await Category.create({
      name: 'Eletrônicos',
      description: 'Produtos eletrônicos em geral'
    });

    expect(category).toBeDefined();
    expect(category.id).toBeDefined();
    expect(category.name).toBe('Eletrônicos');
    expect(category.slug).toBe('eletronicos');
  });

  test('Não deve criar categoria com nome duplicado', async () => {
    await Category.create({
      name: 'Teste Duplicado'
    });

    await expect(Category.create({
      name: 'Teste Duplicado'
    })).rejects.toThrow();
  });

  test('Não deve criar categoria sem nome', async () => {
    await expect(Category.create({
      description: 'Sem nome'
    })).rejects.toThrow();
  });

  test('Deve encontrar categoria por slug', async () => {
    await Category.create({
      name: 'Categoria Teste'
    });

    const category = await Category.findBySlug('categoria-teste');
    expect(category).toBeDefined();
    expect(category.name).toBe('Categoria Teste');
  });

  test('Método getOrCreate deve funcionar', async () => {
    const { category, created } = await Category.getOrCreate('Nova Categoria');
    expect(category).toBeDefined();
    expect(created).toBe(true);

    const { category: existing, created: createdAgain } = await Category.getOrCreate('Nova Categoria');
    expect(existing).toBeDefined();
    expect(createdAgain).toBe(false);
  });
});