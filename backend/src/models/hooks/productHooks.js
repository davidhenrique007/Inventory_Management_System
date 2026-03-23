const { Op } = require('sequelize');

const beforeCreate = async (product, options) => {
  // Garantir que campos obrigatórios existam
  if (product.stockQuantity === undefined) product.stockQuantity = 0;
  if (product.minStock === undefined) product.minStock = 5;
  if (product.maxStock === undefined) product.maxStock = 100;
  if (product.price === undefined) product.price = 0;
  if (product.isActive === undefined) product.isActive = true;

  // Formatar código para uppercase
  if (product.code) {
    product.code = product.code.toUpperCase().trim();
  }

  // Gerar código se não fornecido
  if (!product.code && product.name) {
    const baseCode = product.name
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-4);
    product.code = `${baseCode}${timestamp}`;
  }

  // Validar relação entre min e max stock
  if (product.minStock > product.maxStock) {
    product.maxStock = product.minStock + 95;
  }

  // Verificar unicidade do código
  const existingProduct = await product.constructor.findOne({
    where: {
      code: product.code,
      id: { [Op.ne]: product.id }
    },
    paranoid: false // Incluir soft deleted
  });

  if (existingProduct) {
    throw new Error('Código do produto já existe');
  }

  console.log(`🔄 Pré-criação do produto: ${product.name || 'sem nome'}`);
};

const beforeUpdate = async (product) => {
  const changes = product.changed();

  if (changes && changes.includes('name')) {
    console.log(`📝 Nome do produto alterado: ${product._previousDataValues.name} -> ${product.name}`);
  }

  if (changes && changes.includes('price')) {
    const oldPrice = product._previousDataValues.price;
    console.log(`💰 Preço alterado: ${oldPrice} -> ${product.price}`);
  }

  if (changes && changes.includes('stockQuantity')) {
    const oldStock = product._previousDataValues.stockQuantity;
    const newStock = product.stockQuantity;
    console.log(`📦 Estoque alterado: ${oldStock} -> ${newStock}`);

    if (newStock <= product.minStock) {
      console.log(`⚠️ ALERTA: Produto ${product.code} com estoque baixo!`);
    }
  }

  if (changes && changes.includes('code')) {
    const oldCode = product._previousDataValues.code;
    const newCode = product.code;
    
    if (oldCode !== newCode) {
      // Verificar unicidade do novo código
      const existingProduct = await product.constructor.findOne({
        where: {
          code: newCode,
          id: { [Op.ne]: product.id }
        },
        paranoid: false
      });
      
      if (existingProduct) {
        throw new Error('Código do produto já existe');
      }
      
      console.log(`🏷️ Código alterado: ${oldCode} -> ${newCode}`);
    }
  }

  if (product.stockQuantity < 0) {
    throw new Error('Estoque não pode ser negativo');
  }

  if (product.price < 0) {
    throw new Error('Preço não pode ser negativo');
  }

  if (product.minStock > product.maxStock) {
    throw new Error('Estoque mínimo não pode ser maior que o máximo');
  }

  if (product.costPrice > product.price) {
    throw new Error('Preço de custo não pode ser maior que o preço de venda');
  }

  product.updatedAt = new Date();
};

const afterCreate = async (product) => {
  console.log(`✅ Produto criado com sucesso: ${product.code}`);
  
  if (product.stockQuantity <= product.minStock) {
    console.log(`⚠️ Novo produto já com estoque baixo!`);
  }
};

const afterUpdate = async (product) => {
  console.log(`✅ Produto atualizado: ${product.code}`);
};

const beforeBulkCreate = async (products) => {
  console.log(`📦 Iniciando criação em lote de ${products.length} produtos`);
  
  for (const product of products) {
    if (!product.code) {
      const baseCode = (product.name || 'PROD')
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      product.code = `${baseCode}${random}`;
    }
  }
};

module.exports = {
  beforeCreate,
  beforeUpdate,
  afterCreate,
  afterUpdate,
  beforeBulkCreate
};