const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function checkUser() {
  try {
    await sequelize.authenticate();
    
    const user = await User.findOne({ 
      where: { email: 'admin@test.com' },
      paranoid: false
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      process.exit(1);
    }
    
    console.log('✅ Usuário encontrado:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Is Active:', user.is_active);
    console.log('- Password hash:', user.password);
    
    // Testar a senha 'admin123'
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`\n🔑 Testando senha '${testPassword}': ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
    
    if (!isValid) {
      // Gerar novo hash e atualizar
      const newHash = await bcrypt.hash('admin123', 10);
      await user.update({ password: newHash });
      console.log('\n🔄 Senha resetada novamente!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Senha: admin123');
      
      // Verificar novamente
      const newIsValid = await bcrypt.compare('admin123', newHash);
      console.log(`✅ Nova senha válida: ${newIsValid}`);
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkUser();
