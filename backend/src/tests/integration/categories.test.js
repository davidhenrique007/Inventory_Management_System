const request = require('supertest');
const app = require('../../app');
const { sequelize, Category, User } = require('../../models');
const { generateTokenPair } = require('../../utils/generateToken');

jest.setTimeout(60000);

describe('Categories API', () => {
  let adminToken;
  let testCategoryId;

  beforeAll(async () => {
    // Garantir conexão ativa
    await sequelize.authenticate();
    
    // Recriar banco de teste
    await sequelize.query('DROP DATABASE IF EXISTS inventory_db_test');
    await sequelize.query('CREATE DATABASE inventory_db_test');
    await sequelize.query('USE inventory_db_test');
    
    await sequelize.sync({ force: true });

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin'
    });

    adminToken = generateTokenPair(admin).accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Deve criar categoria', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Teste' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Teste');
    
    testCategoryId = response.body.data.id;
  });

  test('Deve listar categorias', async () => {
    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.categories.length).toBeGreaterThan(0);
  });

  test('Deve buscar por ID', async () => {
    const response = await request(app)
      .get(`/api/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testCategoryId);
  });

  test('Deve atualizar categoria', async () => {
    const response = await request(app)
      .put(`/api/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Atualizado' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Atualizado');
  });

  test('Deve deletar categoria', async () => {
    const response = await request(app)
      .delete(`/api/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});