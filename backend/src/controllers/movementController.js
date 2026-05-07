const { Movement, Product, User } = require('../models');
const StockService = require('../services/stockService');
const { 
  validateEntryMovement, 
  validateExitMovement,
  validateAdjustmentMovement,
  validateProductHistory 
} = require('../validations/movementValidation');

const movementController = {
  async createEntryMovement(req, res, next) {
    try {
      const validatedData = validateEntryMovement(req.body);
      
      const product = await Product.findByPk(validatedData.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Nenhum produto encontrado com o ID ${validatedData.productId}`
        });
      }
      
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: 'PRODUCT_INACTIVE',
          message: 'Não é possível movimentar um produto inativo'
        });
      }
      
      const movement = await Movement.create({
        productId: validatedData.productId,
        type: 'IN',
        quantity: validatedData.quantity,
        unitPrice: validatedData.unitPrice,
        referenceId: validatedData.referenceId,
        referenceType: validatedData.referenceType || 'PURCHASE',
        notes: validatedData.notes,
        createdBy: req.user.id
      });
      
      const updatedProduct = await Product.findByPk(product.id);
      
      res.status(201).json({
        success: true,
        message: 'Entrada de estoque registrada com sucesso',
        data: {
          movement: {
            id: movement.id,
            productId: movement.productId,
            type: movement.type,
            quantity: movement.quantity,
            previousStock: movement.previousStock,
            currentStock: movement.currentStock,
            unitPrice: movement.unitPrice,
            totalPrice: movement.totalPrice,
            referenceId: movement.referenceId,
            referenceType: movement.referenceType,
            notes: movement.notes,
            createdAt: movement.createdAt
          },
          product: {
            id: updatedProduct.id,
            name: updatedProduct.name,
            code: updatedProduct.code,
            stockQuantity: updatedProduct.stockQuantity
          }
        }
      });
      
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Erro de validação',
          details: error.errors
        });
      }
      next(error);
    }
  },

  async createExitMovement(req, res, next) {
    try {
      const validatedData = validateExitMovement(req.body);
      
      const product = await Product.findByPk(validatedData.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Nenhum produto encontrado com o ID ${validatedData.productId}`
        });
      }
      
      if (product.stockQuantity < validatedData.quantity) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: `Estoque insuficiente. Disponível: ${product.stockQuantity}`,
          currentStock: product.stockQuantity
        });
      }
      
      const result = await StockService.executeExit({
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        unitPrice: validatedData.unitPrice,
        referenceId: validatedData.referenceId,
        referenceType: validatedData.referenceType || 'SALE',
        notes: validatedData.notes,
        userId: req.user.id
      });
      
      res.status(201).json({
        success: true,
        message: 'Saída de estoque registrada com sucesso',
        data: {
          movement: {
            id: result.movement.id,
            productId: result.movement.productId,
            type: result.movement.type,
            quantity: result.movement.quantity,
            previousStock: result.product.previousStock,
            currentStock: result.product.newStock,
            unitPrice: result.movement.unitPrice,
            totalPrice: result.movement.totalPrice,
            referenceId: result.movement.referenceId,
            referenceType: result.movement.referenceType,
            notes: result.movement.notes,
            createdAt: result.movement.createdAt
          },
          product: {
            id: result.product.id,
            name: result.product.name,
            code: result.product.code,
            stockQuantity: result.product.newStock
          }
        }
      });
      
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Erro de validação',
          details: error.errors
        });
      }
      next(error);
    }
  },

  async quickExit(req, res, next) {
    try {
      const { code, quantity, notes } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'CODE_REQUIRED',
          message: 'Código do produto é obrigatório'
        });
      }
      
      const product = await Product.findOne({ where: { code: code.toUpperCase() } });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Produto com código ${code} não encontrado`
        });
      }
      
      const validation = await StockService.validateExit(product.id, quantity);
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          message: validation.message
        });
      }
      
      const result = await StockService.executeExit({
        productId: product.id,
        quantity,
        notes: notes || 'Saída rápida via código de barras',
        userId: req.user.id
      });
      
      res.status(201).json({
        success: true,
        message: 'Saída registrada com sucesso',
        data: {
          product: {
            id: result.product.id,
            name: result.product.name,
            code: result.product.code,
            previousStock: result.product.previousStock,
            newStock: result.product.newStock
          },
          quantity,
          remainingStock: result.product.newStock
        }
      });
      
    } catch (error) {
      next(error);
    }
  },

  async batchExit(req, res, next) {
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_BATCH',
          message: 'Lista de itens inválida'
        });
      }
      
      const results = {
        success: [],
        errors: []
      };
      
      for (const item of items) {
        try {
          const { productId, quantity, notes } = item;
          
          const result = await StockService.executeExit({
            productId,
            quantity,
            notes: notes || 'Saída em lote',
            userId: req.user.id
          });
          
          results.success.push({
            productId,
            productName: result.product.name,
            quantity,
            newStock: result.product.newStock
          });
          
        } catch (error) {
          results.errors.push({
            productId: item.productId,
            quantity: item.quantity,
            error: error.message
          });
        }
      }
      
      res.status(207).json({
        success: results.errors.length === 0,
        message: `${results.success.length} itens processados, ${results.errors.length} falhas`,
        data: results
      });
      
    } catch (error) {
      next(error);
    }
  },

  async createAdjustmentMovement(req, res, next) {
    try {
      const validatedData = validateAdjustmentMovement(req.body);
      
      const product = await Product.findByPk(validatedData.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Nenhum produto encontrado com o ID ${validatedData.productId}`
        });
      }
      
      const difference = validatedData.newStock - product.stockQuantity;
      
      const movement = await Movement.create({
        productId: validatedData.productId,
        type: 'ADJUSTMENT',
        quantity: Math.abs(difference),
        notes: validatedData.notes,
        createdBy: req.user.id
      });
      
      const updatedProduct = await Product.findByPk(product.id);
      
      res.status(201).json({
        success: true,
        message: 'Ajuste de estoque realizado com sucesso',
        data: {
          movement: {
            id: movement.id,
            productId: movement.productId,
            type: movement.type,
            quantity: movement.quantity,
            previousStock: movement.previousStock,
            currentStock: movement.currentStock,
            notes: movement.notes,
            createdAt: movement.createdAt
          },
          product: {
            id: updatedProduct.id,
            name: updatedProduct.name,
            code: updatedProduct.code,
            previousStock: movement.previousStock,
            newStock: updatedProduct.stockQuantity,
            difference
          }
        }
      });
      
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Erro de validação',
          details: error.errors
        });
      }
      next(error);
    }
  },

  async getProductMovements(req, res, next) {
    try {
      const validated = validateProductHistory(req.params, req.query);
      
      const product = await Product.findByPk(validated.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Nenhum produto encontrado com o ID ${validated.productId}`
        });
      }
      
      const { movements, pagination } = await Movement.getByProduct(
        validated.productId,
        { page: validated.page, limit: validated.limit }
      );
      
      res.json({
        success: true,
        data: {
          product: {
            id: product.id,
            name: product.name,
            code: product.code,
            currentStock: product.stockQuantity
          },
          movements,
          pagination
        }
      });
      
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Erro de validação',
          details: error.errors
        });
      }
      next(error);
    }
  },

  async getMovementSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      let start = startDate ? new Date(startDate) : new Date();
      let end = endDate ? new Date(endDate) : new Date();
      
      if (startDate) start.setHours(0, 0, 0, 0);
      else start.setDate(start.getDate() - 30);
      
      if (endDate) end.setHours(23, 59, 59, 999);
      else end.setHours(23, 59, 59, 999);
      
      const summary = await Movement.getSummary(start, end);
      
      const result = {
        period: { start, end },
        movements: {
          IN: { total: 0, quantity: 0, value: 0 },
          OUT: { total: 0, quantity: 0, value: 0 },
          ADJUSTMENT: { total: 0, quantity: 0, value: 0 }
        }
      };
      
      summary.forEach(item => {
        if (result.movements[item.type]) {
          result.movements[item.type] = {
            total: parseInt(item.dataValues.totalMovements),
            quantity: parseInt(item.dataValues.totalQuantity),
            value: parseFloat(item.dataValues.totalValue || 0)
          };
        }
      });
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      next(error);
    }
  },

  async getRecentMovements(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      
      const movements = await Movement.findAll({
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit, 10)
      });
      
      res.json({
        success: true,
        data: movements
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = movementController;
