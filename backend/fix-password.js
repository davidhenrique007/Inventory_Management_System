const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/models');

async function fixPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');
    
    // Hash da senha 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('✅ Hash gerado:', hashedPassword);
    
    // Atualizar diretamente via SQL
    const [result] = await sequelize.query(
      'UPDATE users SET password = :password WHERE email = :email',
      {
        replacements: { 
          password: hashedPassword, 
          email: 'admin@test.com' 
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log(`✅ Senha atualizada! Linhas afetadas: ${result}`);
    
    // Verificar se a senha foi atualizada
    const [user] = await sequelize.query(
      'SELECT id, email, password FROM users WHERE email = :email',
      {
        replacements: { email: 'admin@test.com' },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (user) {
      console.log('\n📧 Usuário encontrado no banco:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Password hash (primeiros 20 chars):', user.password.substring(0, 20) + '...');
      
      // Testar a senha diretamente
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log('- Senha "admin123" é válida?', isValid ? '✅ SIM' : '❌ NÃO');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

fixPassword();
