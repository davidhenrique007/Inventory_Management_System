const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Categoria já existe'
      },
      validate: {
        notEmpty: {
          msg: 'Nome da categoria é obrigatório'
        },
        len: {
          args: [3, 100],
          msg: 'Nome deve ter entre 3 e 100 caracteres'
        },
        async isUnique(value) {
          const category = await Category.findOne({ where: { name: value } });
          if (category && category.id !== this.id) {
            throw new Error('Categoria já cadastrada');
          }
        }
      }
    },
    slug: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Descrição não pode ter mais de 500 caracteres'
        }
      }
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,

    hooks: {
      beforeCreate: async (category) => {
        if (category.name && !category.slug) {
          category.slug = slugify(category.name, {
            lower: true,
            strict: true,
            locale: 'pt'
          });
        }
      },
      beforeUpdate: async (category) => {
        if (category.changed('name')) {
          category.slug = slugify(category.name, {
            lower: true,
            strict: true,
            locale: 'pt'
          });
        }
      }
    },

    scopes: {
      withProducts: {
        include: ['products']
      },
      ordered: {
        order: [['name', 'ASC']]
      }
    }
  });

  // Métodos estáticos
  Category.findByName = function(name) {
    return this.findOne({ where: { name } });
  };

  Category.findBySlug = function(slug) {
    return this.findOne({ where: { slug } });
  };

  Category.getOrCreate = async function(name, description = '') {
    const [category, created] = await this.findOrCreate({
      where: { name },
      defaults: { name, description }
    });
    return { category, created };
  };

  return Category;
};