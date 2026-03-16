const { sequelize } = require('../../config/database');
const Product = require('../../models/Product')(sequelize, sequelize.Sequelize);
const Category = require('../../models/Category')(sequelize, sequelize.Sequelize);

describe('🧪 Model Product', () => {
  let category;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    category = await Category.create({
      name: 'Test Category'
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
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Notebook Teste');
    expect(product.code).toBe('NOTE001');
    expect(product.price).toBe(2500.00);
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

  test('Método getTotalValue deve calcular valor total', async () => {
    const total = await Product.getTotalValue();
    expect(typeof total).toBe('number');
  });
});