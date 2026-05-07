const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./src/models');

async function resetPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');
    
    // Hash da senha 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Atualizar senha do usuário
    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { email: 'admin@test.com' } }
    );
    
    if (updated > 0) {
      console.log('✅ Senha resetada com sucesso!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Nova senha: admin123');
    } else {
      console.log('⚠️ Usuário admin@test.com não encontrado');
      
      // Criar usuário se não existir
      const newUser = await User.create({
        id: require('uuid').v4(),
        name: 'Administrador',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Usuário criado com sucesso!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Senha: admin123');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

resetPassword();
