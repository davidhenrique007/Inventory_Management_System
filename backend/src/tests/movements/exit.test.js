const request = require('supertest');
const app = require('../../app');
const { sequelize, Product, Category, User, Movement } = require('../../models');
const { generateTokenPair } = require('../../utils/generateToken');

describe('📤 Movimentações de Estoque - Saída', () => {
  let adminToken;
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

    const operator = await User.create({
      name: 'Operator Test',
      email: 'operator@test.com',
      password: '123456',
      role: 'operator'
    });

    adminToken = generateTokenPair(admin).accessToken;
    operatorToken = generateTokenPair(operator).accessToken;

    // Criar categoria
    const category = await Category.create({ name: 'Test Category' });
    testCategoryId = category.id;

    // Criar produto com estoque
    const product = await Product.create({
      name: 'Produto Teste',
      code: 'TEST001',
      categoryId: testCategoryId,
      price: 100.00,
      stockQuantity: 20,
      minStock: 5
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/movements/exit', () => {
    test('Deve registrar saída válida', async () => {
      const response = await request(app)
        .post('/api/movements/exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          quantity: 3,
          unitPrice: 95.00,
          referenceId: 'PED-001',
          referenceType: 'ORDER',
          notes: 'Venda para cliente'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.movement.type).toBe('OUT');
      expect(response.body.data.movement.quantity).toBe(3);
    });

    test('Deve registrar saída com quantidade mínima', async () => {
      const response = await request(app)
        .post('/api/movements/exit')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          productId: testProductId,
          quantity: 1,
          notes: 'Venda unitária'
        });

      expect(response.status).toBe(201);
    });

    test('Não deve registrar saída com quantidade maior que estoque', async () => {
      const response = await request(app)
        .post('/api/movements/exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          quantity: 999,
          notes: 'Tentativa inválida'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('INSUFFICIENT_STOCK');
    });

    test('Não deve registrar saída sem productId', async () => {
      const response = await request(app)
        .post('/api/movements/exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 5,
          notes: 'Teste'
        });

      expect(response.status).toBe(400);
    });

    test('Não deve registrar saída sem quantity', async () => {
      const response = await request(app)
        .post('/api/movements/exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          notes: 'Teste'
        });

      expect(response.status).toBe(400);
    });

    test('Não deve registrar saída com quantity negativa', async () => {
      const response = await request(app)
        .post('/api/movements/exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          quantity: -5,
          notes: 'Teste'
        });

      expect(response.status).toBe(400);
    });

    test('Não deve registrar saída para produto inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/movements/exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: fakeId,
          quantity: 5
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/movements/quick-exit', () => {
    test('Deve registrar saída rápida por código', async () => {
      const response = await request(app)
        .post('/api/movements/quick-exit')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          code: 'TEST001',
          quantity: 2,
          notes: 'Venda rápida'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.product.code).toBe('TEST001');
    });

    test('Não deve registrar saída com código inexistente', async () => {
      const response = await request(app)
        .post('/api/movements/quick-exit')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          code: 'INVALIDO',
          quantity: 1
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/movements/batch-exit', () => {
    test('Deve registrar múltiplas saídas em lote', async () => {
      // Criar produtos adicionais
      const product2 = await Product.create({
        name: 'Produto 2',
        code: 'TEST002',
        categoryId: testCategoryId,
        price: 50.00,
        stockQuantity: 10
      });

      const response = await request(app)
        .post('/api/movements/batch-exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            { productId: testProductId, quantity: 1, notes: 'Item 1' },
            { productId: product2.id, quantity: 2, notes: 'Item 2' }
          ]
        });

      expect(response.status).toBe(207);
      expect(response.body.data.success).toHaveLength(2);
      expect(response.body.data.errors).toHaveLength(0);
    });

    test('Deve processar parcialmente com erros', async () => {
      const response = await request(app)
        .post('/api/movements/batch-exit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            { productId: testProductId, quantity: 1, notes: 'Item válido' },
            { productId: '00000000-0000-0000-0000-000000000000', quantity: 1, notes: 'Item inválido' }
          ]
        });

      expect(response.status).toBe(207);
      expect(response.body.data.success).toHaveLength(1);
      expect(response.body.data.errors).toHaveLength(1);
    });
  });
});