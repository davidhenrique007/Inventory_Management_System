const { sequelize, Sequelize } = require('../config/database');

// Importar models
const User = require('./User')(sequelize, Sequelize);
const Category = require('./Category')(sequelize, Sequelize);
const Product = require('./Product')(sequelize, Sequelize);
const Movement = require('./Movement')(sequelize, Sequelize);

// ==================== ASSOCIAÇÕES ====================

// Category -> Products (1:N)
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Product -> Movements (1:N)
Product.hasMany(Movement, {
  foreignKey: 'product_id',
  as: 'movements',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Movement.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// User -> Movements (1:N)
User.hasMany(Movement, {
  foreignKey: 'created_by',
  as: 'movements',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Movement.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'user'
});

// ==================== EXPORT ====================

module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Product,
  Movement,
  
  // Helper para sincronizar
  syncDatabase: async (force = false) => {
    try {
      await sequelize.sync({ 
        alter: { drop: false },
        force 
      });
      console.log('✅ Modelos sincronizados com o banco');
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error.message);
      throw error;
    }
  },

  // Helper para verificar conexão
  isConnected: async () => {
    try {
      await sequelize.authenticate();
      return true;
    } catch {
      return false;
    }
  }
};