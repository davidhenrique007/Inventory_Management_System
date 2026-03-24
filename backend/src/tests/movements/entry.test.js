const request = require('supertest');
const app = require('../../app');
const { sequelize, Product, Category, User, Movement } = require('../../models');
const { generateTokenPair } = require('../../utils/generateToken');

describe('📦 Movimentações de Estoque - Entrada', () => {
  let adminToken;
  let operatorToken;
  let testCategoryId;
  let testProductId;
  let testProductInitialStock;

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
    testCategoryId = category.id;

    // Criar produto
    const product = await Product.create({
      name: 'Produto Teste',
      code: 'TEST001',
      categoryId: testCategoryId,
      price: 100.00,
      stockQuantity: 10,
      minStock: 3
    });
    testProductId = product.id;
    testProductInitialStock = product.stockQuantity;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/movements/entry', () => {
    test('Deve registrar entrada com sucesso', async () => {
      const response = await request(app)
        .post('/api/movements/entry')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          quantity: 5,
          unitPrice: 95.00,
          referenceId: 'NF-001',
          referenceType: 'INVOICE',
          notes: 'Compra de reposição'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.movement.type).toBe('IN');
      expect(response.body.data.movement.quantity).toBe(5);
      expect(response.body.data.product.stockQuantity).toBe(testProductInitialStock + 5);
    });

    test('Deve registrar entrada com quantidade mínima', async () => {
      const response = await request(app)
        .post('/api/movements/entry')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          productId: testProductId,
          quantity: 1,
          notes: 'Reposição mínima'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('Não deve registrar entrada sem productId', async () => {
      const response = await request(app)
        .post('/api/movements/entry')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 5,
          notes: 'Teste'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Erro de validação');
    });

    test('Não deve registrar entrada sem quantity', async () => {
      const response = await request(app)
        .post('/api/movements/entry')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          notes: 'Teste'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Erro de validação');
    });

    test('Não deve registrar entrada com quantity negativa', async () => {
      const response = await request(app)
        .post('/api/movements/entry')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          quantity: -5,
          notes: 'Teste'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Erro de validação');
    });

    test('Não deve registrar entrada para produto inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/movements/entry')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: fakeId,
          quantity: 5,
          notes: 'Teste'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Produto não encontrado');
    });
  });

  describe('GET /api/movements/product/:productId', () => {
    test('Deve retornar histórico de movimentações', async () => {
      const response = await request(app)
        .get(`/api/movements/product/${testProductId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.movements).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('Deve retornar 404 para produto inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/movements/product/${fakeId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/movements/recent', () => {
    test('Deve retornar últimas movimentações', async () => {
      const response = await request(app)
        .get('/api/movements/recent')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});