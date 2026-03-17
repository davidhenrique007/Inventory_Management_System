jest.setTimeout(30000);

const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');
const { generateTokenPair } = require('../utils/generateToken');

describe('🔐 Autenticação - Auth API', () => {
  let testUser;
  
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
      expect(response.body.data.user.email).toBe('teste@email.com');
      expect(response.body.data.user.password).toBeUndefined();

      testUser = response.body.data.user;
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
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('Não deve registrar sem senha', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sem Senha',
          email: 'sem@email.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
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
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('Não deve fazer login com senha errada', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: 'senhaerrada'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('Não deve fazer login com email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@email.com',
          password: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('Deve renovar access token com refresh token válido', async () => {
      // Primeiro fazer login para obter tokens
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: '123456'
        });

      const { refreshToken } = login.body.data.tokens;

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.accessToken).not.toBe(login.body.data.tokens.accessToken);
    });

    it('Não deve renovar com refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'token_invalido' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('Deve verificar token válido', async () => {
      // Fazer login
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: '123456'
        });

      const { accessToken } = login.body.data.tokens;

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('teste@email.com');
      expect(response.body.data.isAuthenticated).toBe(true);
    });

    it('Não deve verificar token ausente', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
    });

    it('Não deve verificar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('Deve alterar senha com dados corretos', async () => {
      // Fazer login
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: '123456'
        });

      const { accessToken } = login.body.data.tokens;

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: '123456',
          newPassword: '654321'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Testar login com nova senha
      const newLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: '654321'
        });

      expect(newLogin.status).toBe(200);
    });

    it('Não deve alterar senha com senha atual errada', async () => {
      // Fazer login
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@email.com',
          password: '654321'
        });

      const { accessToken } = login.body.data.tokens;

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'senhaerrada',
          newPassword: '123456'
        });

      expect(response.status).toBe(401);
    });
  });
});
