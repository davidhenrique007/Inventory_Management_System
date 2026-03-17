const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');

const app = express();

// ==================== CONFIGURAÇÕES ====================
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// ==================== SEGURANÇA ====================

// Helmet com configurações personalizadas
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS configurado
const corsOptions = {
  origin: isDevelopment 
    ? ['http://localhost:4200', 'http://localhost:3000']
    : process.env.FRONTEND_URL || 'https://seusite.com',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Compressão
app.use(compression());

// ==================== RATE LIMITING ====================

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: { 
    success: false, 
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});
app.use('/api', limiter);

// Rate limit mais restrito para autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 tentativas por hora
  message: { 
    success: false, 
    error: 'Muitas tentativas de login, aguarde 1 hora' 
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip
});

// ==================== MIDDLEWARES GERAIS ====================

// Parse de JSON com limite
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Só loga erros em produção
  }));
}

// ==================== ROTAS PÚBLICAS ====================

// Health check aprimorado
app.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    database: 'pending'
  };

  try {
    // Testar conexão com banco (se quiser)
    // await sequelize.authenticate();
    healthcheck.database = 'connected';
  } catch (error) {
    healthcheck.database = 'disconnected';
    healthcheck.status = 'degraded';
  }

  res.status(200).json(healthcheck);
});

// Rota base
app.get('/', (req, res) => {
  res.json({
    name: 'Inventory Management API',
    version: '1.0.0',
    description: 'API profissional para gestão de estoque',
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh-token',
        me: 'GET /api/auth/me'
      },
      docs: '/api/docs'
    },
    documentation: 'https://github.com/seu-repo/inventory-management'
  });
});

// ==================== ROTAS DA API ====================

// Rotas de autenticação com rate limit específico
app.use('/api/auth', authLimiter, authRoutes);

// ==================== TRATAMENTO DE ERROS 404 ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    message: `Não foi possível encontrar ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ==================== TRATAMENTO DE ERROS GLOBAL ====================

app.use((err, req, res, next) => {
  // Log do erro
  console.error('🔥 Erro:', {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Erros específicos do JWT
  if (err.name === 'UnauthorizedError' || err.code === 'UNAUTHORIZED') {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado',
      message: err.message || 'Token inválido ou expirado'
    });
  }

  // Erros de validação
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      details: err.errors?.map(e => e.message) || err.details || err.message
    });
  }

  // Erros de duplicidade no banco
  if (err.name === 'SequelizeUniqueConstraintError' || err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Conflito',
      message: 'Registro já existe no sistema',
      field: err.fields || err.parent?.sqlMessage
    });
  }

  // Erros de conexão com banco
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return res.status(503).json({
      success: false,
      error: 'Serviço indisponível',
      message: 'Erro de conexão com o banco de dados'
    });
  }

  // Erro genérico
  const status = err.status || 500;
  const response = {
    success: false,
    error: err.message || 'Erro interno do servidor',
    code: err.code || 'INTERNAL_ERROR'
  };

  if (isDevelopment) {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(status).json(response);
});

// ==================== TRATAMENTO DE PROMESSAS NÃO TRATADAS ====================

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', {
    reason: reason.message || reason,
    stack: reason.stack,
    promise
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  
  // Em produção, você pode querer reiniciar o processo
  if (isProduction) {
    process.exit(1);
  }
});

module.exports = app;