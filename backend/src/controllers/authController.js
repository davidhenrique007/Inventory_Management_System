const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/generateToken');
const authConfig = require('../config/auth');

const authController = {
  /**
   * Registro de novo usuário
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      // Validações básicas
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Dados incompletos',
          message: 'Nome, email e senha são obrigatórios'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Email inválido',
          message: 'Formato de email inválido'
        });
      }

      // Validar força da senha
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Senha fraca',
          message: 'Senha deve ter no mínimo 6 caracteres'
        });
      }

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email já cadastrado',
          message: 'Este email já está em uso'
        });
      }

      // Criar usuário (a senha será hasheada pelo hook do model)
      const user = await User.create({
        name,
        email,
        password, // O hook beforeCreate fará o hash
        role: role || 'operator',
        isActive: true
      });

      // Gerar tokens
      const tokens = generateTokenPair(user);

      // Remover senha do objeto retornado
      const userResponse = user.toJSON();

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user: userResponse,
          tokens
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Login de usuário
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validações básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Dados incompletos',
          message: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário com senha (usando scope withPassword)
      const user = await User.scope('withPassword').findOne({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Usuário inativo',
          message: 'Sua conta está desativada. Contate o administrador.'
        });
      }

      // Validar senha
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      // Atualizar último login
      await user.update({ lastLogin: new Date() });

      // Gerar tokens
      const tokens = generateTokenPair(user);

      // Remover senha do objeto retornado
      const userResponse = user.toJSON();

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userResponse,
          tokens
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh token - obter novo access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token obrigatório',
          message: 'Token de refresh é necessário'
        });
      }

      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Buscar usuário
      const user = await User.findByPk(decoded.sub);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado',
          message: 'Usuário não existe mais no sistema'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Usuário inativo',
          message: 'Sua conta está desativada'
        });
      }

      // Gerar novo access token
      const accessToken = generateAccessToken(user);

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          accessToken,
          tokenType: 'Bearer',
          expiresIn: authConfig.jwtExpiresIn
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout (opcional - apenas para invalidar tokens no cliente)
   */
  async logout(req, res) {
    // Como estamos usando JWT stateless, o logout é feito no cliente
    // Aqui podemos apenas retornar sucesso
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  },

  /**
   * Verificar token atual
   */
  async verifyToken(req, res) {
    // O middleware já verificou o token, só retornamos o usuário
    res.json({
      success: true,
      data: {
        user: req.user,
        isAuthenticated: true
      }
    });
  },

  /**
   * Alterar senha
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Dados incompletos',
          message: 'Senha atual e nova senha são obrigatórias'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Senha fraca',
          message: 'Nova senha deve ter no mínimo 6 caracteres'
        });
      }

      // Buscar usuário com senha atual
      const user = await User.scope('withPassword').findByPk(userId);

      // Validar senha atual
      const isValidPassword = await user.validatePassword(currentPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Senha incorreta',
          message: 'Senha atual não confere'
        });
      }

      // Atualizar senha (o hook do model fará o hash)
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;