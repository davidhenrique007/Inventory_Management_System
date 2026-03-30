const request = require('supertest');
const app = require('../../app');
const { sequelize, Product, Category, User, Movement } = require('../../models');
const { generateTokenPair } = require('../../utils/generateToken');

describe('📊 Relatórios - Dashboard API', () => {
  let adminToken;
  let operatorToken;

  beforeAll(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin'
    });

    const operator = await User.create({
      name: 'Operator Test',
      email: 'operator@test.com',
      password: '123456',
      role: 'operator'
    });

    adminToken = generateTokenPair(admin).accessToken;
    operatorToken = generateTokenPair(operator).accessToken;

    // Criar categoria
    const category = await Category.create({
      name: 'Test Category'
    });

    // Criar produtos
    await Product.create({
      name: 'Produto Normal',
      code: 'NORMAL001',
      categoryId: category.id,
      price: 100.00,
      stockQuantity: 20,
      minStock: 5
    });

    await Product.create({
      name: 'Produto Baixo Estoque',
      code: 'LOW001',
      categoryId: category.id,
      price: 50.00,
      stockQuantity: 3,
      minStock: 5
    });

    await Product.create({
      name: 'Produto Sem Estoque',
      code: 'ZERO001',
      categoryId: category.id,
      price: 75.00,
      stockQuantity: 0,
      minStock: 5
    });

    // Criar movimentações
    await Movement.create({
      productId: (await Product.findOne({ where: { code: 'NORMAL001' } })).id,
      type: 'IN',
      quantity: 10,
      previousStock: 10,
      currentStock: 20,
      createdBy: admin.id
    });

    await Movement.create({
      productId: (await Product.findOne({ where: { code: 'NORMAL001' } })).id,
      type: 'OUT',
      quantity: 5,
      previousStock: 20,
      currentStock: 15,
      createdBy: admin.id
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/reports/dashboard', () => {
    test('Deve retornar dados do dashboard', async () => {
      const response = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.total).toBe(3);
      expect(response.body.data.products.lowStock).toBeGreaterThanOrEqual(2);
      expect(response.body.data.stock.totalQuantity).toBe(23);
    });

    test('Operador pode acessar dashboard', async () => {
      const response = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/reports/low-stock', () => {
    test('Deve listar produtos com estoque baixo', async () => {
      const response = await request(app)
        .get('/api/reports/low-stock')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.products[0].status).toBeDefined();
    });

    test('Deve suportar paginação', async () => {
      const response = await request(app)
        .get('/api/reports/low-stock?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/reports/recent-movements', () => {
    test('Deve listar movimentações recentes', async () => {
      const response = await request(app)
        .get('/api/reports/recent-movements')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('Deve filtrar por tipo', async () => {
      const response = await request(app)
        .get('/api/reports/recent-movements?type=IN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every(m => m.type === 'IN')).toBe(true);
    });

    test('Deve limitar resultados', async () => {
      const response = await request(app)
        .get('/api/reports/recent-movements?limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('GET /api/reports/movement-summary', () => {
    test('Admin pode ver resumo de movimentações', async () => {
      const response = await request(app)
        .get('/api/reports/movement-summary?period=day')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.movements).toBeDefined();
    });

    test('Operador não pode ver resumo', async () => {
      const response = await request(app)
        .get('/api/reports/movement-summary')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/reports/movement-chart', () => {
    test('Deve retornar dados para gráfico', async () => {
      const response = await request(app)
        .get('/api/reports/movement-chart?days=7')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(7);
    });
  });

  describe('GET /api/reports/top-products', () => {
    test('Admin pode ver top produtos', async () => {
      const response = await request(app)
        .get('/api/reports/top-products?limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('Operador não pode ver top produtos', async () => {
      const response = await request(app)
        .get('/api/reports/top-products')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(403);
    });
  });
});