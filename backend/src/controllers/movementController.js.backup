const { Movement, Product, User } = require('../models');
const { 
  validateEntryMovement, 
  validateExitMovement,
  validateAdjustmentMovement,
  validateProductHistory 
} = require('../validations/movementValidation');

const movementController = {
  /**
   * Registrar entrada de estoque
   * POST /api/movements/entry
   */
  async createEntryMovement(req, res, next) {
    try {
      const validatedData = validateEntryMovement(req.body);
      
      // Verificar se produto existe
      const product = await Product.findByPk(validatedData.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedData.productId}`
        });
      }
      
      // Verificar se produto está ativo
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Produto inativo',
          message: 'Não é possível movimentar um produto inativo'
        });
      }
      
      // Criar movimentação
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
      
      // Buscar produto atualizado com categoria
      const updatedProduct = await Product.findByPk(product.id, {
        include: [
          {
            model: require('../models').Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
      
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
            stockQuantity: updatedProduct.stockQuantity,
            category: updatedProduct.category
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

  /**
   * Registrar saída de estoque
   * POST /api/movements/exit
   */
  async createExitMovement(req, res, next) {
    try {
      const validatedData = validateExitMovement(req.body);
      
      // Verificar se produto existe
      const product = await Product.findByPk(validatedData.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedData.productId}`
        });
      }
      
      // Verificar estoque disponível
      if (product.stockQuantity < validatedData.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Estoque insuficiente',
          message: `Estoque atual (${product.stockQuantity}) é insuficiente para a saída de ${validatedData.quantity} unidades`
        });
      }
      
      // Criar movimentação
      const movement = await Movement.create({
        productId: validatedData.productId,
        type: 'OUT',
        quantity: validatedData.quantity,
        unitPrice: validatedData.unitPrice,
        referenceId: validatedData.referenceId,
        referenceType: validatedData.referenceType || 'SALE',
        notes: validatedData.notes,
        createdBy: req.user.id
      });
      
      // Buscar produto atualizado
      const updatedProduct = await Product.findByPk(product.id, {
        include: [
          {
            model: require('../models').Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Saída de estoque registrada com sucesso',
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
            stockQuantity: updatedProduct.stockQuantity,
            category: updatedProduct.category
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

  /**
   * Ajuste manual de estoque
   * POST /api/movements/adjustment
   */
  async createAdjustmentMovement(req, res, next) {
    try {
      const validatedData = validateAdjustmentMovement(req.body);
      
      // Verificar se produto existe
      const product = await Product.findByPk(validatedData.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedData.productId}`
        });
      }
      
      // Calcular diferença
      const difference = validatedData.newStock - product.stockQuantity;
      
      // Criar movimentação
      const movement = await Movement.create({
        productId: validatedData.productId,
        type: 'ADJUSTMENT',
        quantity: Math.abs(difference),
        notes: validatedData.notes,
        createdBy: req.user.id
      });
      
      // Atualizar estoque (já foi feito pelo hook)
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

  /**
   * Histórico de movimentações por produto
   * GET /api/movements/product/:productId
   */
  async getProductMovements(req, res, next) {
    try {
      const validated = validateProductHistory(req.params, req.query);
      
      // Verificar se produto existe
      const product = await Product.findByPk(validated.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
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

  /**
   * Resumo de movimentações por período
   * GET /api/movements/summary
   */
  async getMovementSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      let start = startDate ? new Date(startDate) : new Date();
      let end = endDate ? new Date(endDate) : new Date();
      
      if (startDate) start.setHours(0, 0, 0, 0);
      else start.setDate(start.getDate() - 30); // últimos 30 dias
      
      if (endDate) end.setHours(23, 59, 59, 999);
      else end.setHours(23, 59, 59, 999);
      
      const summary = await Movement.getSummary(start, end);
      
      // Formatar resultado
      const result = {
        period: {
          start,
          end
        },
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

  /**
   * Últimas movimentações do sistema
   * GET /api/movements/recent
   */
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