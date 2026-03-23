const request = require('supertest');
const app = require('../../app');
const { sequelize, Product, Category, User } = require('../../models');
const { generateTokenPair } = require('../../utils/generateToken');
const path = require('path');

describe('📦 Products API - Testes de Integração', () => {
  let adminToken;
  let managerToken;
  let operatorToken;
  let testCategoryId;
  let testProductId;

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

    const manager = await User.create({
      name: 'Manager Test',
      email: 'manager@test.com',
      password: '123456',
      role: 'manager'
    });

    const operator = await User.create({
      name: 'Operator Test',
      email: 'operator@test.com',
      password: '123456',
      role: 'operator'
    });

    adminToken = generateTokenPair(admin).accessToken;
    managerToken = generateTokenPair(manager).accessToken;
    operatorToken = generateTokenPair(operator).accessToken;

    // Criar categoria de teste
    const category = await Category.create({
      name: 'Test Category',
      description: 'Categoria para testes'
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/products', () => {
    test('Deve criar produto com sucesso (admin)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produto Teste',
          code: 'TEST001',
          categoryId: testCategoryId,
          price: 99.90,
          stockQuantity: 10,
          minStock: 3,
          maxStock: 50
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Produto Teste');
      expect(response.body.data.code).toBe('TEST001');

      testProductId = response.body.data.id;
    });

    test('Não deve criar produto com código duplicado', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Outro Produto',
          code: 'TEST001',
          categoryId: testCategoryId,
          price: 50.00,
          stockQuantity: 5
        });

      expect(response.status).toBe(409);
    });

    test('Não deve criar produto sem nome', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TEST002',
          categoryId: testCategoryId,
          price: 50.00
        });

      expect(response.status).toBe(400);
    });

    test('Não deve criar produto com preço negativo', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produto Inválido',
          code: 'TEST002',
          categoryId: testCategoryId,
          price: -10,
          stockQuantity: 5
        });

      expect(response.status).toBe(400);
    });

    test('Manager pode criar produto', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Produto Manager',
          code: 'MGR001',
          categoryId: testCategoryId,
          price: 75.00,
          stockQuantity: 8
        });

      expect(response.status).toBe(201);
    });

    test('Operador não pode criar produto', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Produto Proibido',
          code: 'OP001',
          categoryId: testCategoryId,
          price: 50.00
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/products/:id', () => {
    test('Deve buscar produto por ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testProductId);
      expect(response.body.data.name).toBe('Produto Teste');
    });

    test('Deve retornar 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('Deve atualizar produto (admin)', async () => {
      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produto Atualizado',
          price: 149.90
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Produto Atualizado');
      expect(parseFloat(response.body.data.price)).toBe(149.90);
    });

    test('Manager pode atualizar produto', async () => {
      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          description: 'Atualizado por manager'
        });

      expect(response.status).toBe(200);
    });

    test('Operador não pode atualizar produto', async () => {
      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Tentativa'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/products/:id/stock', () => {
    test('Deve adicionar estoque', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProductId}/stock`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          quantity: 5,
          type: 'IN',
          notes: 'Compra de reposição'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.newStock).toBeGreaterThanOrEqual(15);
    });

    test('Deve remover estoque', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProductId}/stock`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          quantity: 3,
          type: 'OUT',
          notes: 'Venda'
        });

      expect(response.status).toBe(200);
    });

    test('Não deve remover mais que o disponível', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProductId}/stock`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          quantity: 999,
          type: 'OUT'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('Admin pode deletar produto', async () => {
      // Criar produto para deletar
      const temp = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Temporário',
          code: 'TEMP001',
          categoryId: testCategoryId,
          price: 10.00,
          stockQuantity: 1
        });

      const tempId = temp.body.data.id;

      const response = await request(app)
        .delete(`/api/products/${tempId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    test('Manager não pode deletar produto', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(403);
    });

    test('Operador não pode deletar produto', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(403);
    });
  });
});