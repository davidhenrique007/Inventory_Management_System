const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User } = require('./src/models');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        id: uuidv4(),
        name: 'Administrador',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    if (created) {
      console.log('✅ Usuário admin criado!');
    } else {
      console.log('⚠️ Usuário já existe, atualizando senha...');
      await user.update({ password: hashedPassword });
      console.log('✅ Senha atualizada!');
    }
    
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Senha: admin123');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdmin();
