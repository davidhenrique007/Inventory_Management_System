module.exports = (sequelize, DataTypes) => {
  const Movement = sequelize.define('Movement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    productId: {
      type: DataTypes.UUID,
      field: 'product_id',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Produto é obrigatório'
        },
        isUUID: 4
      }
    },
    type: {
      type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['IN', 'OUT', 'ADJUSTMENT']],
          msg: 'Tipo de movimento inválido'
        }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Quantidade deve ser um número inteiro'
        },
        min: {
          args: [1],
          msg: 'Quantidade deve ser maior que zero'
        }
      }
    },
    previousStock: {
      type: DataTypes.INTEGER,
      field: 'previous_stock',
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currentStock: {
      type: DataTypes.INTEGER,
      field: 'current_stock',
      allowNull: false,
      validate: {
        min: 0
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'unit_price',
      validate: {
        min: 0
      },
      get() {
        const value = this.getDataValue('unitPrice');
        return value ? parseFloat(value) : null;
      }
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'total_price',
      validate: {
        min: 0
      },
      get() {
        const value = this.getDataValue('totalPrice');
        return value ? parseFloat(value) : null;
      }
    },
    notes: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 500]
      }
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Usuário responsável é obrigatório'
        },
        isUUID: 4
      }
    }
  }, {
    tableName: 'movements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,

    hooks: {
      beforeCreate: async (movement) => {
        movement.previousStock = movement.previousStock || 0;
        movement.currentStock = movement.type === 'IN'
          ? movement.previousStock + movement.quantity
          : movement.previousStock - movement.quantity;

        if (movement.unitPrice && movement.quantity) {
          movement.totalPrice = movement.unitPrice * movement.quantity;
        }
      }
    },

    indexes: [
      {
        fields: ['product_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['type']
      }
    ],

    scopes: {
      recent: {
        order: [['created_at', 'DESC']],
        limit: 50
      },
      byProduct: (productId) => ({
        where: { productId }
      }),
      byType: (type) => ({
        where: { type }
      }),
      byDateRange: (startDate, endDate) => ({
        where: {
          created_at: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        }
      })
    }
  });

  // Métodos de instância
  Movement.prototype.getMovementTypeText = function() {
    const types = {
      'IN': 'Entrada',
      'OUT': 'Saída',
      'ADJUSTMENT': 'Ajuste'
    };
    return types[this.type] || this.type;
  };

  Movement.prototype.isEntry = function() {
    return this.type === 'IN';
  };

  Movement.prototype.isExit = function() {
    return this.type === 'OUT';
  };

  // Métodos estáticos
  Movement.getByProduct = function(productId, limit = 100) {
    return this.scope('byProduct', 'recent').findAll({
      where: { productId },
      limit
    });
  };

  Movement.getTodayMovements = async function() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.scope('byDateRange', 'recent').findAll({
      where: {
        created_at: { [sequelize.Op.between]: [start, end] }
      }
    });
  };

  Movement.getSummary = async function(startDate, endDate) {
    return this.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalMovements'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'totalValue']
      ],
      where: {
        created_at: { [sequelize.Op.between]: [startDate, endDate] }
      },
      group: ['type']
    });
  };

  return Movement;
};