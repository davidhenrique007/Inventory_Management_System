const request = require('supertest');
const app = require('../../app');
const { sequelize, Category, User } = require('../../models');
const { generateTokenPair } = require('../../utils/generateToken');

describe('📁 Categories API - Testes de Integração', () => {
  let adminToken;
  let managerToken;
  let operatorToken;
  let testCategoryId;

  beforeAll(async () => {
    // Configurar banco de testes
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Criar usuários de teste
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

    // Gerar tokens
    adminToken = generateTokenPair(admin).accessToken;
    managerToken = generateTokenPair(manager).accessToken;
    operatorToken = generateTokenPair(operator).accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/categories', () => {
    it('Deve criar categoria com sucesso (admin)', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Eletrônicos',
          description: 'Produtos eletrônicos em geral'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Eletrônicos');
      expect(response.body.data.slug).toBe('eletronicos');

      testCategoryId = response.body.data.id;
    });

    it('Não deve permitir categoria duplicada', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Eletrônicos'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Conflito');
    });

    it('Não deve permitir criação sem nome', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Sem nome'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Erro de validação');
    });

    it('Não deve permitir criação por operador', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Teste',
          description: 'Teste'
        });

      expect(response.status).toBe(403);
    });

    it('Manager pode criar categoria', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Informática',
          description: 'Teste manager'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/categories', () => {
    it('Deve listar categorias com paginação', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.categories).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('Deve filtrar por nome', async () => {
      const response = await request(app)
        .get('/api/categories?name=Eletrônicos')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].name).toBe('Eletrônicos');
    });

    it('Deve retornar página vazia para filtro inexistente', async () => {
      const response = await request(app)
        .get('/api/categories?name=Inexistente')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.categories).toHaveLength(0);
    });

    it('Deve validar parâmetros de paginação', async () => {
      const response = await request(app)
        .get('/api/categories?page=-1&limit=1000')
        .set('Authorization', `Bearer ${operatorToken}`);

      // Deve usar valores padrão ou validar
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('Deve buscar categoria por ID', async () => {
      const response = await request(app)
        .get(`/api/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testCategoryId);
      expect(response.body.data.name).toBe('Eletrônicos');
    });

    it('Deve retornar 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/categories/${fakeId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(404);
    });

    it('Deve validar formato do ID', async () => {
      const response = await request(app)
        .get('/api/categories/id-invalido')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('Deve atualizar categoria (admin)', async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Eletrônicos Atualizado',
          description: 'Nova descrição'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Eletrônicos Atualizado');
      expect(response.body.data.slug).toBe('eletronicos-atualizado');
    });

    it('Manager pode atualizar categoria', async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          description: 'Atualizado por manager'
        });

      expect(response.status).toBe(200);
    });

    it('Operador não pode atualizar categoria', async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Tentativa'
        });

      expect(response.status).toBe(403);
    });

    it('Não deve permitir nome duplicado', async () => {
      // Criar outra categoria
      const newCat = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Única' });

      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Única' });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('Admin pode deletar categoria', async () => {
      // Criar categoria para deletar
      const temp = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Temporária' });

      const tempId = temp.body.data.id;

      const response = await request(app)
        .delete(`/api/categories/${tempId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Manager não pode deletar categoria', async () => {
      const response = await request(app)
        .delete(`/api/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(403);
    });

    it('Operador não pode deletar categoria', async () => {
      const response = await request(app)
        .delete(`/api/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(403);
    });

    it('Não deve permitir deletar categoria com produtos', async () => {
      // Este teste requer criar um produto vinculado
      // Será implementado quando tivermos products CRUD
    });
  });

  describe('GET /api/categories/slug/:slug', () => {
    it('Deve buscar por slug', async () => {
      const response = await request(app)
        .get('/api/categories/slug/eletronicos-atualizado')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Eletrônicos Atualizado');
    });

    it('Deve retornar 404 para slug inexistente', async () => {
      const response = await request(app)
        .get('/api/categories/slug/inexistente')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/categories/with-count', () => {
    it('Admin pode ver categorias com contagem', async () => {
      const response = await request(app)
        .get('/api/categories/with-count')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('Manager pode ver categorias com contagem', async () => {
      const response = await request(app)
        .get('/api/categories/with-count')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
    });

    it('Operador não pode ver categorias com contagem', async () => {
      const response = await request(app)
        .get('/api/categories/with-count')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(403);
    });
  });
});