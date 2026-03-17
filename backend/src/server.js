require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    await testConnection();
    
    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: { drop: false } });
      console.log('✅ Modelos sincronizados com o banco');
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`
      🚀 Servidor rodando!
      ===================
      📡 Porta: ${PORT}
      🌍 Ambiente: ${process.env.NODE_ENV || 'development'}
      🔗 URL: http://localhost:${PORT}
      📊 Health: http://localhost:${PORT}/health
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recebido, encerrando servidor...');
      server.close(() => {
        console.log('💤 Servidor encerrado');
        sequelize.close();
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT recebido, encerrando servidor...');
      server.close(() => {
        console.log('💤 Servidor encerrado');
        sequelize.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = startServer;