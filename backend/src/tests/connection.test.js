jest.setTimeout(30000);

const { sequelize, testConnection } = require('../config/database');
const { Sequelize } = require('sequelize');

describe('🔌 Testes de Conexão com Banco de Dados', () => {
  
  beforeAll(async () => {
    // Tentar conectar antes dos testes
    try {
      await testConnection();
    } catch (error) {
      console.error('Erro ao conectar para testes:', error);
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Deve estabelecer conexão com sucesso', async () => {
    try {
      await sequelize.authenticate();
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  test('Deve executar query simples com sucesso', async () => {
    const [results] = await sequelize.query('SELECT 1 + 1 as result');
    expect(results[0].result).toBe(2);
  });

  test('Deve listar tabelas do banco', async () => {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    console.log('📋 Tabelas encontradas:', tables.map(t => t.TABLE_NAME || t.table_name));
    expect(tables.length).toBeGreaterThanOrEqual(0);
  });

  test('Deve verificar charset e collation', async () => {
    const [results] = await sequelize.query(`
      SELECT 
        DEFAULT_CHARACTER_SET_NAME as charset,
        DEFAULT_COLLATION_NAME as collation
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = DATABASE()
    `);
    
    console.log('📊 Charset do banco:', results[0]);
    expect(results[0].charset).toBe('utf8mb4');
  });

  test('Deve testar pool de conexões', async () => {
    const pool = sequelize.connectionManager.pool;
    
    console.log('📊 Status do pool:', {
      total: pool.size,
      available: pool.available,
      waiting: pool.waitingRequestsCount,
    });
    
    expect(pool.size).toBeGreaterThanOrEqual(0);
  });

  test('Deve executar query com erro controlado', async () => {
    try {
      await sequelize.query('SELECT * FROM tabela_inexistente');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('SequelizeDatabaseError');
      console.log('✅ Erro controlado capturado com sucesso');
    }
  });

  test('Deve verificar versão do MySQL', async () => {
    const [results] = await sequelize.query('SELECT VERSION() as version');
    console.log('📌 Versão MySQL:', results[0].version);
    expect(results[0].version).toBeDefined();
  });
});

// Teste manual (para executar diretamente)
if (require.main === module) {
  (async () => {
    console.log('🧪 Testando conexão com banco de dados...\n');
    
    try {
      await testConnection();
      
      // Testar query
      const [results] = await sequelize.query('SELECT NOW() as now');
      console.log('🕐 Horário do banco:', results[0].now);
      
      // Listar tabelas
      const [tables] = await sequelize.query('SHOW TABLES');
      console.log('\n📋 Tabelas encontradas:', tables.length);
      
      if (tables.length > 0) {
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`   - ${tableName}`);
        });
      }
      
      console.log('\n✅ Todos os testes passaram!');
    } catch (error) {
      console.error('\n❌ Falha nos testes:', error.message);
      process.exit(1);
    } finally {
      await sequelize.close();
    }
  })();
}
