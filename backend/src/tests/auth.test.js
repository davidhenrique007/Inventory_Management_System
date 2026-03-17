jest.setTimeout(30000);

const request = require('supertest');
const app = require('../../app');
const { sequelize, User } = require('../../models');

describe('🔐 Autenticação - Auth API', () => {
  
  beforeAll(async () => {
    await sequelize.sync({ alter: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar usuários antes de cada teste
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/auth/register', () => {
    test('Deve registrar um novo usuário com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuário Teste',
          email: 'teste@email.com',
          password: '123456',
          role: 'operator'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe('teste@email.com');
    });

    test('Não deve registrar com email duplicado', async () => {
      await User.create({
        name: 'Primeiro',
        email: 'duplicado@email.com',
        password: '123456'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Segundo',
          email: 'duplicado@email.com',
          password: '123456'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login Test',
        email: 'login@email.com',
        password: '123456',
        role: 'operator'
      });
    });

    test('Deve fazer login com credenciais corretas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@email.com',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tokens');
    });

    test('Não deve fazer login com senha errada', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@email.com',
          password: 'senhaerrada'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});