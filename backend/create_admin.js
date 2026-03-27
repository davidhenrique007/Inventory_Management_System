const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');
    
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        name: 'Administrador',
        email: 'admin@test.com',
        password: '123456',
        role: 'admin'
      }
    });
    
    if (created) {
      console.log('✅ Usuário admin criado!');
    } else {
      console.log('⚠️ Usuário já existe, atualizando senha...');
      user.password = '123456';
      await user.save();
      console.log('✅ Senha atualizada!');
    }
    
    console.log('Usuário:', user.email, 'Role:', user.role);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdmin();
