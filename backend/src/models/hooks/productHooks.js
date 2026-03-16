const beforeCreate = async (product) => {
  // Garantir que campos obrigatórios existam
  if (!product.stockQuantity) {
    product.stockQuantity = 0;
  }

  if (!product.minStock) {
    product.minStock = 5;
  }

  if (!product.maxStock) {
    product.maxStock = 100;
  }

  if (!product.price) {
    product.price = 0;
  }

  // Formatar código para uppercase
  if (product.code) {
    product.code = product.code.toUpperCase().trim();
  }

  // Gerar código se não fornecido
  if (!product.code && product.name) {
    const baseCode = product.name
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    
    const timestamp = Date.now().toString().slice(-4);
    product.code = `${baseCode}${timestamp}`;
  }

  // Validar relação entre min e max stock
  if (product.minStock > product.maxStock) {
    product.maxStock = product.minStock + 95; // Ajuste automático
  }

  console.log(`🔄 Pré-criação do produto: ${product.name || 'sem nome'}`);
};

const beforeUpdate = async (product) => {
  const changes = product.changed();

  // Se o nome mudou, verificar se precisa atualizar algo
  if (changes.includes('name')) {
    console.log(`📝 Nome do produto alterado: ${product._previousDataValues.name} -> ${product.name}`);
  }

  // Se o preço mudou, log para auditoria
  if (changes.includes('price')) {
    const oldPrice = product._previousDataValues.price;
    console.log(`💰 Preço alterado: ${oldPrice} -> ${product.price}`);
  }

  // Se a quantidade mudou, verificar se está baixo
  if (changes.includes('stockQuantity')) {
    const oldStock = product._previousDataValues.stockQuantity;
    const newStock = product.stockQuantity;
    
    console.log(`📦 Estoque alterado: ${oldStock} -> ${newStock}`);

    // Se ficou abaixo do mínimo, alertar
    if (newStock <= product.minStock) {
      console.log(`⚠️ ALERTA: Produto ${product.code} com estoque baixo!`);
    }
  }

  // Validar se estoque não ficou negativo
  if (product.stockQuantity < 0) {
    throw new Error('Estoque não pode ser negativo');
  }

  // Validar se preço não ficou negativo
  if (product.price < 0) {
    throw new Error('Preço não pode ser negativo');
  }

  // Atualizar timestamps
  product.updatedAt = new Date();
};

const afterCreate = async (product) => {
  console.log(`✅ Produto criado com sucesso: ${product.code}`);
  
  // Aqui você poderia enviar notificação, email, etc
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