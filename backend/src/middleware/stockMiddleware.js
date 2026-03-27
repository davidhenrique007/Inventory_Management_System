const StockService = require('../services/stockService');

/**
 * Middleware para validar estoque antes da saída
 */
const validateStockBeforeExit = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos',
        message: 'ProductId e quantity são obrigatórios'
      });
    }
    
    const validation = await StockService.validateExit(productId, quantity);
    
    if (!validation.valid) {
      const status = validation.error === 'PRODUCT_NOT_FOUND' ? 404 : 400;
      return res.status(status).json({
        success: false,
        error: validation.error,
        message: validation.message,
        ...(validation.currentStock !== undefined && { currentStock: validation.currentStock })
      });
    }
    
    // Anexar dados de validação à requisição
    req.stockValidation = validation;
    next();
    
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar se o produto existe
 */
const validateProductExists = async (req, res, next) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'PRODUCT_ID_REQUIRED',
        message: 'ID do produto é obrigatório'
      });
    }
    
    const Product = require('../models').Product;
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Produto não encontrado'
      });
    }
    
    req.product = product;
    next();
    
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar quantidade positiva
 */
const validatePositiveQuantity = (req, res, next) => {
  const { quantity } = req.body;
  
  if (quantity === undefined || quantity === null) {
    return res.status(400).json({
      success: false,
      error: 'QUANTITY_REQUIRED',
      message: 'Quantidade é obrigatória'
    });
  }
  
  if (typeof quantity !== 'number' || isNaN(quantity)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_QUANTITY_TYPE',
      message: 'Quantidade deve ser um número'
    });
  }
  
  if (quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_QUANTITY',
      message: 'Quantidade deve ser maior que zero'
    });
  }
  
  if (!Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      error: 'QUANTITY_NOT_INTEGER',
      message: 'Quantidade deve ser um número inteiro'
    });
  }
  
  next();
};

module.exports = {
  validateStockBeforeExit,
  validateProductExists,
  validatePositiveQuantity
};