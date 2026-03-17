const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

/**
 * Gera access token (curta duração)
 */
const generateAccessToken = (user) => {
  try {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    };

    const options = {
      expiresIn: authConfig.jwtExpiresIn,
      algorithm: authConfig.algorithm,
      issuer: authConfig.issuer,
      audience: authConfig.audience
    };

    return jwt.sign(payload, authConfig.jwtSecret, options);
  } catch (error) {
    console.error('❌ Erro ao gerar access token:', error.message);
    throw new Error('Falha ao gerar token de acesso');
  }
};

/**
 * Gera refresh token (longa duração)
 */
const generateRefreshToken = (user) => {
  try {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      version: '1.0'
    };

    const options = {
      expiresIn: authConfig.refreshExpiresIn,
      algorithm: authConfig.algorithm,
      issuer: authConfig.issuer,
      audience: authConfig.audience
    };

    return jwt.sign(payload, authConfig.refreshSecret, options);
  } catch (error) {
    console.error('❌ Erro ao gerar refresh token:', error.message);
    throw new Error('Falha ao gerar token de refresh');
  }
};

/**
 * Verifica e decodifica access token
 */
const verifyAccessToken = (token) => {
  try {
    const options = {
      algorithms: [authConfig.algorithm],
      issuer: authConfig.issuer,
      audience: authConfig.audience
    };

    const decoded = jwt.verify(token, authConfig.jwtSecret, options);
    
    if (decoded.type !== 'access') {
      throw new Error('Tipo de token inválido');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw error;
  }
};

/**
 * Verifica e decodifica refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    const options = {
      algorithms: [authConfig.algorithm],
      issuer: authConfig.issuer,
      audience: authConfig.audience
    };

    const decoded = jwt.verify(token, authConfig.refreshSecret, options);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Tipo de token inválido');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token inválido');
    }
    throw error;
  }
};

/**
 * Gera par de tokens (access + refresh)
 */
const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: authConfig.jwtExpiresIn,
    tokenType: 'Bearer'
  };
};

/**
 * Extrai token do header Authorization
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  extractTokenFromHeader
};