const { sequelize } = require('../../config/database');
const Category = require('../../models/Category')(sequelize, sequelize.Sequelize);

describe('🧪 Model Category', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
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
    await expect(Category.create({
      name: 'Eletrônicos'
    })).rejects.toThrow();
  });

  test('Não deve criar categoria sem nome', async () => {
    await expect(Category.create({
      description: 'Sem nome'
    })).rejects.toThrow();
  });

  test('Deve encontrar categoria por slug', async () => {
    const category = await Category.findBySlug('eletronicos');
    expect(category).toBeDefined();
    expect(category.name).toBe('Eletrônicos');
  });

  test('Método getOrCreate deve funcionar', async () => {
    const { category, created } = await Category.getOrCreate('Novo Teste');
    expect(category).toBeDefined();
    expect(created).toBe(true);

    const { category: existing, created: createdAgain } = await Category.getOrCreate('Novo Teste');
    expect(existing).toBeDefined();
    expect(createdAgain).toBe(false);
  });
});