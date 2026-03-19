const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const {
  validatePagination,
  validateProductFilters,
  validateSorting
} = require('../utils/validators');
const { validateProductId, validateProductQuery } = require('../validations/productValidation');

const productController = {
  /**
   * Listar todos os produtos com filtros e paginação
   * GET /api/products
   */
  async getAllProducts(req, res, next) {
    try {
      // Validar parâmetros de query
      const validatedQuery = validateProductQuery(req.query);
      
      // Configurar paginação
      const { page, limit, offset } = validatePagination(validatedQuery);
      
      // Configurar ordenação
      const { sortBy, order } = validateSorting(validatedQuery);
      
      // Construir filtros
      const where = {};
      
      if (validatedQuery.category) {
        where.categoryId = validatedQuery.category;
      }
      
      if (validatedQuery.code) {
        where.code = { [Op.like]: `%${validatedQuery.code}%` };
      }
      
      if (validatedQuery.name) {
        where.name = { [Op.like]: `%${validatedQuery.name}%` };
      }
      
      if (validatedQuery.isActive !== undefined) {
        where.isActive = validatedQuery.isActive;
      }
      
      // Filtro por estoque baixo
      if (validatedQuery.lowStock) {
        where.stockQuantity = { [Op.lte]: sequelize.col('minStock') };
      }
      
      // Buscar produtos com categoria
      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        attributes: { exclude: ['categoryId'] },
        limit,
        offset,
        order: [[sortBy, order]]
      });
      
      // Calcular paginação
      const totalPages = Math.ceil(count / limit);
      
      res.json({
        success: true,
        data: {
          products: rows,
          pagination: {
            total: count,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
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
   * Buscar produto por ID
   * GET /api/products/:id
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validar ID
      const validatedId = validateProductId(id);
      
      // Buscar produto
      const product = await Product.findByPk(validatedId, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        attributes: { exclude: ['categoryId'] }
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedId}`
        });
      }
      
      res.json({
        success: true,
        data: product
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
   * Buscar produto por código
   * GET /api/products/code/:code
   */
  async getProductByCode(req, res, next) {
    try {
      const { code } = req.params;
      
      if (!code || code.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Código inválido',
          message: 'Código deve ter no mínimo 3 caracteres'
        });
      }
      
      const product = await Product.findOne({
        where: { code: code.toUpperCase() },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        attributes: { exclude: ['categoryId'] }
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o código ${code}`
        });
      }
      
      res.json({
        success: true,
        data: product
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Listar produtos com estoque baixo
   * GET /api/products/low-stock
   */
  async getLowStockProducts(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Product.findAndCountAll({
        where: {
          isActive: true,
          stockQuantity: { [Op.lte]: sequelize.col('minStock') }
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ],
        limit: parseInt(limit, 10),
        offset,
        order: [['stockQuantity', 'ASC']]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      res.json({
        success: true,
        data: {
          products: rows,
          pagination: {
            total: count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;