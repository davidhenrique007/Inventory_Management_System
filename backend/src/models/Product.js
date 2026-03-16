const { validateProduct } = require('./validations/productValidation');
const { beforeCreate, beforeUpdate } = require('./hooks/productHooks');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome do produto é obrigatório'
        },
        len: {
          args: [3, 255],
          msg: 'Nome deve ter entre 3 e 255 caracteres'
        }
      }
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Código do produto já existe'
      },
      validate: {
        notEmpty: {
          msg: 'Código do produto é obrigatório'
        },
        len: {
          args: [3, 50],
          msg: 'Código deve ter entre 3 e 50 caracteres'
        },
        is: {
          args: /^[A-Z0-9-]+$/i,
          msg: 'Código deve conter apenas letras, números e hífen'
        }
      }
    },
    barcode: {
      type: DataTypes.STRING(50),
      unique: {
        msg: 'Código de barras já existe'
      },
      validate: {
        isValidBarcode(value) {
          if (value && !/^\d{8,14}$/.test(value)) {
            throw new Error('Código de barras deve ter entre 8 e 14 dígitos');
          }
        }
      }
    },
    categoryId: {
      type: DataTypes.UUID,
      field: 'category_id',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Categoria é obrigatória'
        },
        isUUID: {
          args: 4,
          msg: 'ID de categoria inválido'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Descrição não pode ter mais de 1000 caracteres'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: {
          msg: 'Preço deve ser um valor decimal válido'
        },
        min: {
          args: [0],
          msg: 'Preço não pode ser negativo'
        },
        max: {
          args: [999999.99],
          msg: 'Preço muito alto'
        }
      },
      get() {
        const value = this.getDataValue('price');
        return value ? parseFloat(value) : 0;
      }
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'cost_price',
      defaultValue: 0,
      validate: {
        isDecimal: true,
        min: 0
      },
      get() {
        const value = this.getDataValue('costPrice');
        return value ? parseFloat(value) : 0;
      }
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      field: 'stock_quantity',
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Quantidade deve ser um número inteiro'
        },
        min: {
          args: [0],
          msg: 'Quantidade em estoque não pode ser negativa'
        }
      }
    },
    minStock: {
      type: DataTypes.INTEGER,
      field: 'min_stock',
      defaultValue: 5,
      validate: {
        isInt: true,
        min: 0
      }
    },
    maxStock: {
      type: DataTypes.INTEGER,
      field: 'max_stock',
      defaultValue: 100,
      validate: {
        isInt: true,
        min: 0
      }
    },
    location: {
      type: DataTypes.STRING(50),
      validate: {
        len: [0, 50]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: 'is_active',
      defaultValue: true
    }
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,

    hooks: {
      beforeCreate: async (product) => {
        await beforeCreate(product);
        await validateProduct(product);
      },
      beforeUpdate: async (product) => {
        await beforeUpdate(product);
        await validateProduct(product);
      },
      afterCreate: (product) => {
        console.log(`✅ Produto criado: ${product.name} (${product.code})`);
      }
    },

    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        unique: true,
        fields: ['barcode']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['stock_quantity']
      }
    ],

    scopes: {
      active: {
        where: { isActive: true }
      },
      lowStock: {
        where: sequelize.where(
          sequelize.col('stock_quantity'),
          '<=',
          sequelize.col('min_stock')
        )
      },
      outOfStock: {
        where: { stockQuantity: 0 }
      },
      withCategory: {
        include: ['category']
      }
    }
  });

  // Métodos de instância
  Product.prototype.getProfitMargin = function() {
    if (!this.costPrice || this.costPrice === 0) return 100;
    return ((this.price - this.costPrice) / this.price) * 100;
  };

  Product.prototype.isLowStock = function() {
    return this.stockQuantity <= this.minStock;
  };

  Product.prototype.isOutOfStock = function() {
    return this.stockQuantity === 0;
  };

  Product.prototype.canSell = function(quantity) {
    return this.stockQuantity >= quantity;
  };

  Product.prototype.updateStock = async function(quantity, type) {
    const newQuantity = type === 'IN' 
      ? this.stockQuantity + quantity
      : this.stockQuantity - quantity;

    if (newQuantity < 0) {
      throw new Error('Estoque insuficiente');
    }

    return this.update({ stockQuantity: newQuantity });
  };

  Product.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values.profitMargin = this.getProfitMargin();
    return values;
  };

  // Métodos estáticos
  Product.findByCode = function(code) {
    return this.findOne({ where: { code } });
  };

  Product.findByBarcode = function(barcode) {
    return this.findOne({ where: { barcode } });
  };

  Product.getLowStock = async function(threshold = null) {
    const where = threshold 
      ? { stockQuantity: { [sequelize.Op.lte]: threshold } }
      : sequelize.where(
          sequelize.col('stock_quantity'),
          '<=',
          sequelize.col('min_stock')
        );

    return this.scope('active').findAll({ where });
  };

  Product.getTotalValue = async function() {
    const result = await this.findAll({
      attributes: [
        [sequelize.fn('SUM', 
          sequelize.literal('price * stock_quantity')
        ), 'totalValue']
      ],
      where: { isActive: true }
    });
    return parseFloat(result[0]?.dataValues?.totalValue || 0);
  };

  Product.bulkUpdateStock = async function(updates) {
    const transaction = await sequelize.transaction();
    
    try {
      for (const { id, quantity, type } of updates) {
        const product = await this.findByPk(id, { transaction });
        if (!product) continue;
        
        await product.updateStock(quantity, type, { transaction });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return Product;
};