jest.setTimeout(30000);

const { sequelize } = require('../../config/database');
const Product = require('../../models/Product')(sequelize, sequelize.Sequelize);
const Category = require('../../models/Category')(sequelize, sequelize.Sequelize);

describe('🧪 Model Product', () => {
  let category;

  beforeAll(async () => {
    // Sincronizar sem force
    await sequelize.sync({ alter: true });
    
    category = await Category.create({
      name: 'Test Category'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar produtos antes de cada teste
    await Product.destroy({ where: {}, force: true });
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
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Notebook Teste');
    expect(product.code).toBe('NOTE001');
    expect(parseFloat(product.price)).toBe(2500.00);
  });

  test('Não deve criar produto com código duplicado', async () => {
    await Product.create({
      name: 'Primeiro Produto',
      code: 'DUPLICADO',
      categoryId: category.id,
      price: 100
    });

    await expect(Product.create({
      name: 'Segundo Produto',
      code: 'DUPLICADO',
      categoryId: category.id,
      price: 200
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
      name: 'Produto Teste',
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
});