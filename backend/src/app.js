const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit'); // 💡 NOVO: Prevenção de brute force
const mongoSanitize = require('express-mongo-sanitize'); // 💡 NOVO: Prevenção NoSQL injection
const xss = require('xss-clean'); // 💡 NOVO: Prevenção XSS
const hpp = require('hpp'); // 💡 NOVO: Prevenção HTTP Parameter Pollution

const app = express();

// ==================== CONFIGURAÇÕES ====================
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// ==================== SEGURANÇA AVANÇADA ====================

// 1. Rate limiting - Previne ataques de brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limit em todas as rotas /api
app.use('/api', limiter);

// 2. Helmet com configurações personalizadas
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // Desabilitar CSP em dev se necessário
    crossOriginEmbedderPolicy: false,
  })
);

// 3. Sanitização de dados
app.use(mongoSanitize()); // Limpa dados maliciosos
app.use(xss()); // Limpa XSS

// 4. Prevenção de Parameter Pollution
app.use(hpp());

// 5. CORS configurado adequadamente
const corsOptions = {
  origin: isDevelopment 
    ? 'http://localhost:4200' // Angular default
    : process.env.CORS_ORIGIN || 'https://seusite.com',
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// ==================== MIDDLEWARES GERAIS ====================
app.use(compression()); // Compressão
app.use(express.json({ limit: '10mb' })); // JSON parser com limite
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== LOGGING PROFISSIONAL ====================
if (isDevelopment) {
  // Morgan para logs de requisição em desenvolvimento
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Logging personalizado em produção
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    if (process.env.NODE_ENV === 'production') {
      // Em produção, log estruturado para ferramentas como Winston/Pino
      console.log(JSON.stringify(log));
    } else {
      // Em desenvolvimento, log colorido
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      console.log(
        `${log.method} ${log.url} ${statusColor}${log.status}\x1b[0m - ${log.duration}`
      );
    }
  });
  next();
});

// ==================== ROTAS PÚBLICAS ====================

// Health check aprimorado
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    database: 'check_your_db_connection' // Você pode adicionar verificação real depois
  });
});

// Rota base
app.get('/', (req, res) => {
  res.json({
    name: 'Inventory Management API',
    version: '1.0.0',
    description: 'API profissional para gestão de estoque',
    documentation: '/api/docs',
    status: 'online',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ROTAS DA API ====================
// (Comentado por enquanto - será implementado nos próximos dias)
/*
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const movementRoutes = require('./routes/movementRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/reports', reportRoutes);
*/

// ==================== TRATAMENTO DE ERROS ====================

// 404 Handler - Rota não encontrada
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

// Error Handler Global
app.use((err, req, res, next) => {
  // Log do erro
  console.error('🔥 Erro não tratado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Erros específicos
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      details: err.details || err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado',
      message: 'Token inválido ou expirado'
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Conflito',
      message: 'Registro duplicado'
    });
  }

  // Erro genérico
  const status = err.status || 500;
  const response = {
    success: false,
    error: err.message || 'Erro interno do servidor'
  };

  // Adicionar stack trace apenas em desenvolvimento
  if (isDevelopment && err.stack) {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(status).json(response);
});

// ==================== TRATAMENTO DE PROMISES NÃO TRATADAS ====================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Em produção, você pode querer logar isso em um serviço como Sentry
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Em produção, você pode querer reiniciar o processo
  process.exit(1);
});

module.exports = app;
