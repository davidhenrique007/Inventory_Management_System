const { verifyAccessToken, extractTokenFromHeader } = require('../utils/generateToken');
const { User } = require('../models');
const authConfig = require('../config/auth');

/**
 * Middleware de autenticação
 * Verifica se o usuário está autenticado
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Extrair token
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      const error = new Error(authConfig.messages.tokenRequired);
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      return next(error);
    }

    // Verificar token
    const decoded = verifyAccessToken(token);

    // Buscar usuário no banco
    const user = await User.findByPk(decoded.sub, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      const error = new Error(authConfig.messages.userNotFound);
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      return next(error);
    }

    if (!user.isActive) {
      const error = new Error('Usuário inativo');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      return next(error);
    }

    // Anexar usuário à requisição
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    error.code = 'UNAUTHORIZED';
    error.status = 401;
    next(error);
  }
};

/**
 * Middleware de autorização por role
 * Verifica se o usuário tem permissão (admin)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error(authConfig.messages.unauthorized);
      error.code = 'FORBIDDEN';
      error.status = 403;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error(authConfig.messages.forbidden);
      error.code = 'FORBIDDEN';
      error.status = 403;
      return next(error);
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não houver token, apenas anexa usuário se existir
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.sub, {
        attributes: { exclude: ['password'] }
      });

      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Ignora erros de autenticação em rotas opcionais
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate
};