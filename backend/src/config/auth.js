require('dotenv').config();

module.exports = {
  // Access token
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  
  // Refresh token
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Configurações do token
  algorithm: 'HS256',
  issuer: 'inventory-management-api',
  audience: 'inventory-management-client',
  
  // Bcrypt
  bcryptRounds: 10,
  
  // Cookies (se usar)
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
  },
  
  // Mensagens
  messages: {
    tokenRequired: 'Token de autenticação é obrigatório',
    tokenInvalid: 'Token inválido ou expirado',
    tokenMalformed: 'Token mal formatado',
    userNotFound: 'Usuário não encontrado',
    unauthorized: 'Não autorizado',
    forbidden: 'Acesso negado'
  }
};