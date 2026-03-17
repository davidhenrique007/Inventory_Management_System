const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');

jest.setTimeout(30000);

describe('?? Autenticação - Auth API', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('Deve registrar um novo usuário com sucesso', async () => {
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
      
      testUser = response.body.data.user;
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it('Não deve registrar com email duplicado', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Outro Usuário',
          email: 'teste@email.com',
          password: '123456'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('Deve fazer login com credenciais corretas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('tokens');
    });

    it('Não deve fazer login com senha errada', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: 'senhaerrada'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('Deve renovar access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('Deve verificar token válido', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isAuthenticated).toBe(true);
    });
  });
});
