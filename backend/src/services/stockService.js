const { Product, Movement } = require('../models');
const { sequelize } = require('../models');

/**
 * Serviço centralizado para operações de estoque
 */
class StockService {
  /**
   * Verifica disponibilidade de estoque
   * @param {string} productId - ID do produto
   * @param {number} quantity - Quantidade desejada
   * @returns {Promise<Object>} - Status e detalhes
   */
  static async checkStockAvailability(productId, quantity) {
    const product = await Product.findByPk(productId);
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    
    const available = product.stockQuantity >= quantity;
    const lowStock = product.stockQuantity <= product.minStock;
    const outOfStock = product.stockQuantity === 0;
    
    return {
      available,
      currentStock: product.stockQuantity,
      requestedQuantity: quantity,
      lowStock,
      outOfStock,
      product: {
        id: product.id,
        name: product.name,
        code: product.code,
        minStock: product.minStock
      }
    };
  }
  
  /**
   * Calcula novo estoque após movimentação
   * @param {Object} product - Produto atual
   * @param {number} quantity - Quantidade movimentada
   * @param {string} type - Tipo de movimento (IN/OUT)
   * @returns {number} - Novo estoque
   */
  static calculateNewStock(product, quantity, type) {
    if (type === 'IN') {
      return product.stockQuantity + quantity;
    } else if (type === 'OUT') {
      if (product.stockQuantity < quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${product.stockQuantity}`);
      }
      return product.stockQuantity - quantity;
    }
    throw new Error('Tipo de movimento inválido');
  }
  
  /**
   * Valida se a saída é permitida
   * @param {Object} product - Produto
   * @param {number} quantity - Quantidade
   * @returns {Promise<Object>} - Resultado da validação
   */
  static async validateExit(productId, quantity) {
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return {
        valid: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Produto não encontrado'
      };
    }
    
    if (!product.isActive) {
      return {
        valid: false,
        error: 'PRODUCT_INACTIVE',
        message: 'Produto inativo. Não é possível realizar saída'
      };
    }
    
    if (quantity <= 0) {
      return {
        valid: false,
        error: 'INVALID_QUANTITY',
        message: 'Quantidade deve ser maior que zero'
      };
    }
    
    if (product.stockQuantity === 0) {
      return {
        valid: false,
        error: 'OUT_OF_STOCK',
        message: 'Produto sem estoque disponível',
        currentStock: 0
      };
    }
    
    if (product.stockQuantity < quantity) {
      return {
        valid: false,
        error: 'INSUFFICIENT_STOCK',
        message: `Estoque insuficiente. Disponível: ${product.stockQuantity}`,
        currentStock: product.stockQuantity,
        requested: quantity
      };
    }
    
    // Verificar se a saída vai causar estoque negativo
    const newStock = product.stockQuantity - quantity;
    if (newStock < 0) {
      return {
        valid: false,
        error: 'NEGATIVE_STOCK',
        message: 'Operação resultaria em estoque negativo',
        currentStock: product.stockQuantity
      };
    }
    
    // Verificar se vai ficar abaixo do mínimo
    const willBeLowStock = newStock <= product.minStock;
    
    return {
      valid: true,
      currentStock: product.stockQuantity,
      newStock,
      willBeLowStock,
      product: {
        id: product.id,
        name: product.name,
        code: product.code,
        minStock: product.minStock
      }
    };
  }
  
  /**
   * Executa saída de estoque com transação
   * @param {Object} data - Dados da movimentação
   * @returns {Promise<Object>} - Resultado da operação
   */
  static async executeExit(data) {
    const transaction = await sequelize.transaction();
    
    try {
      const { productId, quantity, unitPrice, referenceId, referenceType, notes, userId } = data;
      
      // Validar antes de prosseguir
      const validation = await this.validateExit(productId, quantity);
      
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Buscar produto
      const product = await Product.findByPk(productId, { transaction });
      
      // Registrar movimento
      const movement = await Movement.create({
        productId,
        type: 'OUT',
        quantity,
        unitPrice,
        referenceId,
        referenceType: referenceType || 'SALE',
        notes,
        createdBy: userId
      }, { transaction });
      
      // Atualizar estoque (já é feito pelo hook, mas garantimos)
      await product.update({ stockQuantity: validation.newStock }, { transaction });
      
      await transaction.commit();
      
      // Buscar produto atualizado
      const updatedProduct = await Product.findByPk(productId);
      
      return {
        success: true,
        movement: movement.toJSON(),
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          code: updatedProduct.code,
          previousStock: validation.currentStock,
          newStock: validation.newStock,
          willBeLowStock: validation.willBeLowStock
        }
      };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * Gera alerta de estoque baixo (para uso futuro)
   * @param {Object} product - Produto
   * @returns {Object} - Alerta
   */
  static generateLowStockAlert(product) {
    return {
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      currentStock: product.stockQuantity,
      minStock: product.minStock,
      severity: product.stockQuantity === 0 ? 'CRITICAL' : 'WARNING',
      message: product.stockQuantity === 0 
        ? 'Produto sem estoque' 
        : `Estoque baixo: ${product.stockQuantity} / ${product.minStock}`
    };
  }
  
  /**
   * Verifica todos os produtos com estoque baixo
   * @returns {Promise<Array>} - Lista de alertas
   */
  static async getLowStockAlerts() {
    const products = await Product.findAll({
      where: {
        isActive: true,
        stockQuantity: { [sequelize.Op.lte]: sequelize.col('minStock') }
      }
    });
    
    return products.map(p => this.generateLowStockAlert(p));
  }
}

module.exports = StockService;