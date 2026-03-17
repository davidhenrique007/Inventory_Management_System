const { sequelize } = require('../../config/database');
const Product = require('../../models/Product')(sequelize, sequelize.Sequelize);
const Category = require('../../models/Category')(sequelize, sequelize.Sequelize);

jest.setTimeout(30000);

describe('?? Model Product', () => {
  let category;

  beforeAll(async () => {
    // Desabilitar checagem de chaves estrangeiras
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Criar categoria para testes
    [category] = await Category.findOrCreate({
      where: { name: 'Test Category' },
      defaults: { description: 'Categoria para testes' }
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Deve criar um produto válido', async () => {
    const product = await Product.create({
      name: 'Notebook Teste',
      code: 'NOTE001',
      categoryId: category.id,
      price: 2500.00,
      stockQuantity: 10,
      minStock: 3
    });

    expect(product).toBeDefined();
    expect(product.name).toBe('Notebook Teste');
    expect(product.code).toBe('NOTE001');
  });

  test('Não deve criar produto com código duplicado', async () => {
    await expect(Product.create({
      name: 'Outro Notebook',
      code: 'NOTE001',
      categoryId: category.id,
      price: 3000.00,
      stockQuantity: 5
    })).rejects.toThrow();
  });

  test('Não deve criar produto com preço negativo', async () => {
    await expect(Product.create({
      name: 'Produto Inválido',
      code: 'INV001',
      categoryId: category.id,
      price: -10,
      stockQuantity: 5
    })).rejects.toThrow();
  });

  test('Não deve criar produto com estoque negativo', async () => {
    await expect(Product.create({
      name: 'Produto Inválido',
      code: 'INV002',
      categoryId: category.id,
      price: 100,
      stockQuantity: -5
    })).rejects.toThrow();
  });

  test('Método isLowStock deve funcionar', async () => {
    const product = await Product.create({
      name: 'Produto Estoque Baixo',
      code: 'LOW001',
      categoryId: category.id,
      price: 50,
      stockQuantity: 2,
      minStock: 5
    });

    expect(product.isLowStock()).toBe(true);
  });

  test('Método updateStock deve atualizar corretamente', async () => {
    const product = await Product.create({
      name: 'Produto Teste Estoque',
      code: 'STK001',
      categoryId: category.id,
      price: 100,
      stockQuantity: 10
    });

    await product.updateStock(5, 'OUT');
    expect(product.stockQuantity).toBe(5);

    await product.updateStock(3, 'IN');
    expect(product.stockQuantity).toBe(8);
  });

  test('Método getLowStock deve retornar produtos com estoque baixo', async () => {
    const lowStockProducts = await Product.getLowStock();
    expect(Array.isArray(lowStockProducts)).toBe(true);
  });
});
