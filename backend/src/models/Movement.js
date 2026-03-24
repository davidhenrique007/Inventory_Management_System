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
      defaultValue: 'IN',
      validate: {
        isIn: {
          args: [['IN', 'OUT', 'ADJUSTMENT']],
          msg: 'Tipo de movimento inválido. Use: IN, OUT ou ADJUSTMENT'
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
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    currentStock: {
      type: DataTypes.INTEGER,
      field: 'current_stock',
      allowNull: false,
      defaultValue: 0,
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
    referenceId: {
      type: DataTypes.STRING(50),
      field: 'reference_id',
      allowNull: true,
      comment: 'Número da nota fiscal, pedido, etc'
    },
    referenceType: {
      type: DataTypes.STRING(50),
      field: 'reference_type',
      allowNull: true,
      comment: 'INVOICE, ORDER, COUNT, etc'
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
        // Buscar o produto para obter o estoque atual
        const Product = sequelize.models.Product;
        const product = await Product.findByPk(movement.productId, {
          paranoid: false
        });
        
        if (!product) {
          throw new Error('Produto não encontrado');
        }
        
        // Definir estoque anterior
        movement.previousStock = product.stockQuantity;
        
        // Calcular novo estoque baseado no tipo de movimento
        if (movement.type === 'IN') {
          movement.currentStock = movement.previousStock + movement.quantity;
        } else if (movement.type === 'OUT') {
          if (movement.previousStock < movement.quantity) {
            throw new Error(`Estoque insuficiente. Disponível: ${movement.previousStock}`);
          }
          movement.currentStock = movement.previousStock - movement.quantity;
        } else if (movement.type === 'ADJUSTMENT') {
          movement.currentStock = movement.quantity;
        }
        
        // Calcular total price se unit price informado
        if (movement.unitPrice && movement.quantity) {
          movement.totalPrice = movement.unitPrice * movement.quantity;
        }
        
        // Garantir que os valores não sejam null
        if (movement.previousStock === undefined || movement.previousStock === null) {
          movement.previousStock = 0;
        }
        if (movement.currentStock === undefined || movement.currentStock === null) {
          movement.currentStock = movement.previousStock;
        }
      },
      
      afterCreate: async (movement) => {
        // Atualizar estoque do produto
        const Product = sequelize.models.Product;
        await Product.update(
          { stockQuantity: movement.currentStock },
          { where: { id: movement.productId } }
        );
        
        console.log(`📦 Movimentação registrada: ${movement.type} | Produto: ${movement.productId} | Qtd: ${movement.quantity} | Estoque: ${movement.currentStock}`);
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
      },
      {
        fields: ['reference_id', 'reference_type']
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
  Movement.getByProduct = async function(productId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await this.findAndCountAll({
      where: { productId },
      include: [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return {
      movements: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  };

  Movement.getTodayEntries = async function() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    return this.findAll({
      where: {
        type: 'IN',
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