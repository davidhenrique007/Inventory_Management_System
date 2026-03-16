const bcrypt = require('bcryptjs');
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório'
        },
        len: {
          args: [3, 100],
          msg: 'Nome deve ter entre 3 e 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Email já está em uso'
      },
      validate: {
        notEmpty: {
          msg: 'Email é obrigatório'
        },
        isEmail: {
          msg: 'Formato de email inválido'
        },
        async isUnique(value) {
          const user = await User.findOne({ where: { email: value } });
          if (user && user.id !== this.id) {
            throw new Error('Email já está cadastrado');
          }
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Senha é obrigatória'
        },
        len: {
          args: [6, 100],
          msg: 'Senha deve ter no mínimo 6 caracteres'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'operator'),
      defaultValue: 'operator',
      allowNull: false,
      validate: {
        isIn: {
          args: [['admin', 'manager', 'operator']],
          msg: 'Role inválida. Use: admin, manager ou operator'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    },

    defaultScope: {
      attributes: { exclude: ['password'] }
    },

    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      },
      active: {
        where: { isActive: true }
      },
      admins: {
        where: { role: 'admin' }
      }
    }
  });

  // Métodos de instância
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  // Métodos estáticos
  User.findByEmail = function(email) {
    return this.findOne({ 
      where: { email },
      ...this.scope('withPassword')
    });
  };

  User.getActiveUsers = function() {
    return this.scope('active').findAll();
  };

  return User;
};