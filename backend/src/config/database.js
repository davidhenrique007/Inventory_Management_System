const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configurações do ambiente
const env = process.env.NODE_ENV || 'development';
const config = {
  development: {
    username: process.env.DB_USER || 'inventory_user',
    password: process.env.DB_PASSWORD || 'inventory_pass',
    database: process.env.DB_NAME || 'inventory_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => console.log(`📦 [SQL] ${msg}`),
  },
  test: {
    username: process.env.DB_USER || 'inventory_user',
    password: process.env.DB_PASSWORD || 'inventory_pass',
    database: process.env.DB_NAME_TEST || 'inventory_test_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

// Criar instância do Sequelize
const sequelize = new Sequelize(
  config[env].database,
  config[env].username,
  config[env].password,
  {
    host: config[env].host,
    port: config[env].port,
    dialect: config[env].dialect,
    logging: config[env].logging,
    
    // Configuração do pool de conexões
    pool: {
      max: 10,              // Máximo de conexões no pool
      min: 2,               // Mínimo de conexões no pool
      acquire: 30000,       // Tempo máximo (ms) para adquirir conexão
      idle: 10000,          // Tempo máximo (ms) que uma conexão pode ficar ociosa
      evict: 1000,          // Intervalo (ms) para verificar conexões ociosas
    },
    
    // Configurações de retry
    retry: {
      max: 3,               // Máximo de tentativas de conexão
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
    
    // Configurações de timezone
    timezone: '-03:00',
    
    // Configurações de query
    define: {
      timestamps: true,      // Adiciona createdAt e updatedAt automaticamente
      underscored: true,     // Usa snake_case para campos
      underscoredAll: true,  // Usa snake_case para tabelas e campos
      paranoid: true,        // Soft delete (deletedAt)
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    
    dialectOptions: {
      charset: 'utf8mb4',
      multipleStatements: true,
      dateStrings: true,
      typeCast: true,
    },
  }
);

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    
    // Verificar configurações do banco
    const [results] = await sequelize.query('SHOW VARIABLES LIKE "character_set_%";');
    console.log('📊 Configurações de charset:', results);
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error.message);
    console.error('Detalhes:', {
      host: config[env].host,
      database: config[env].database,
      user: config[env].username,
      port: config[env].port,
      env: env,
    });
    throw error;
  }
};

// Função para sincronizar modelos (apenas em desenvolvimento)
const syncDatabase = async (force = false) => {
  if (env === 'development') {
    try {
      await sequelize.sync({ 
        alter: { drop: false }, // Atualiza estrutura sem dropar dados
        force: force, // True apenas se quiser recriar tudo
      });
      console.log('✅ Modelos sincronizados com o banco de dados');
    } catch (error) {
      console.error('❌ Erro ao sincronizar modelos:', error.message);
    }
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  Sequelize,
  env,
  config: config[env],
};