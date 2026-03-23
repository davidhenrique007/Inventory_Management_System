const { sequelize } = require('../models');
const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const {
  validatePagination,
  validateProductFilters,
  validateSorting
} = require('../utils/validators');
const {
  validateProductId,
  validateProductQuery,
  validateCreateProduct,
  validateUpdateProduct
} = require('../validations/productValidation');

const productController = {
  /**
   * Listar todos os produtos com filtros e paginação
   * GET /api/products
   */
  async getAllProducts(req, res, next) {
    try {
      const validatedQuery = validateProductQuery(req.query);
      const { page, limit, offset } = validatePagination(validatedQuery);
      const { sortBy, order } = validateSorting(validatedQuery);
      
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
      
      if (validatedQuery.lowStock) {
        where.stockQuantity = { [Op.lte]: sequelize.col('minStock') };
      }
      
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
      const validatedId = validateProductId(id);
      
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
          stockQuantity: {
            [Op.lte]: sequelize.literal('min_stock')
          }
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
  },

  /**
   * Criar novo produto
   * POST /api/products
   */
  async createProduct(req, res, next) {
    try {
      const validatedData = validateCreateProduct(req.body);
      
      // Verificar se categoria existe
      const category = await Category.findByPk(validatedData.categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada',
          message: 'A categoria informada não existe'
        });
      }
      
      // Verificar se código já existe
      const existingProduct = await Product.findOne({
        where: { code: validatedData.code },
        paranoid: false
      });
      
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          message: 'Já existe um produto com este código'
        });
      }
      
      // Criar produto
      const product = await Product.create(validatedData);
      
      // Buscar produto com categoria para resposta
      const productWithCategory = await Product.findByPk(product.id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        attributes: { exclude: ['categoryId'] }
      });
      
      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: productWithCategory
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
   * Atualizar produto
   * PUT /api/products/:id
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const validatedId = validateProductId(id);
      const validatedData = validateUpdateProduct(req.body);
      
      // Buscar produto
      const product = await Product.findByPk(validatedId, {
        paranoid: false
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedId}`
        });
      }
      
      // Se está alterando categoria, verificar se existe
      if (validatedData.categoryId) {
        const category = await Category.findByPk(validatedData.categoryId);
        if (!category) {
          return res.status(404).json({
            success: false,
            error: 'Categoria não encontrada',
            message: 'A categoria informada não existe'
          });
        }
      }
      
      // Atualizar produto
      await product.update(validatedData);
      
      // Buscar produto atualizado com categoria
      const updatedProduct = await Product.findByPk(product.id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        attributes: { exclude: ['categoryId'] }
      });
      
      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: updatedProduct
      });
      
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Erro de validação',
          details: error.errors
        });
      }
      if (error.message === 'Código do produto já existe') {
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          message: error.message
        });
      }
      next(error);
    }
  },

  /**
   * Remover produto (soft delete)
   * DELETE /api/products/:id
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const validatedId = validateProductId(id);
      
      // Buscar produto
      const product = await Product.findByPk(validatedId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedId}`
        });
      }
      
      // Verificar se há movimentações associadas
      const movementCount = await product.countMovements();
      if (movementCount > 0) {
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          message: `Não é possível excluir: existem ${movementCount} movimentação(ões) vinculada(s) a este produto`
        });
      }
      
      // Soft delete
      await product.destroy();
      
      res.json({
        success: true,
        message: 'Produto removido com sucesso',
        data: { id: validatedId }
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
   * Upload de imagem do produto
   * POST /api/products/:id/image
   */
  async uploadProductImage(req, res, next) {
    try {
      const { id } = req.params;
      const validatedId = validateProductId(id);
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado',
          message: 'Uma imagem é necessária para o upload'
        });
      }
      
      const product = await Product.findByPk(validatedId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedId}`
        });
      }
      
      // Remover imagem antiga se existir
      if (product.imageUrl) {
        const { removeImage } = require('../config/multer');
        removeImage(product.imageUrl);
      }
      
      // Gerar URL da imagem
      const { getImageUrl } = require('../config/multer');
      const imageUrl = getImageUrl(req.file.filename, req);
      
      // Atualizar produto
      await product.update({ imageUrl });
      
      res.json({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: { imageUrl }
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
   * Remover imagem do produto
   * DELETE /api/products/:id/image
   */
  async deleteProductImage(req, res, next) {
    try {
      const { id } = req.params;
      const validatedId = validateProductId(id);
      
      const product = await Product.findByPk(validatedId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedId}`
        });
      }
      
      if (!product.imageUrl) {
        return res.status(404).json({
          success: false,
          error: 'Imagem não encontrada',
          message: 'Este produto não possui imagem cadastrada'
        });
      }
      
      // Remover arquivo
      const { removeImage } = require('../config/multer');
      removeImage(product.imageUrl);
      
      // Remover referência no banco
      await product.update({ imageUrl: null });
      
      res.json({
        success: true,
        message: 'Imagem removida com sucesso'
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
   * Atualizar estoque do produto
   * PATCH /api/products/:id/stock
   */
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, type, notes } = req.body;
      const validatedId = validateProductId(id);
      
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantidade inválida',
          message: 'Quantidade deve ser um número positivo'
        });
      }
      
      if (!type || !['IN', 'OUT'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo inválido',
          message: 'Tipo deve ser IN ou OUT'
        });
      }
      
      const product = await Product.findByPk(validatedId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Nenhum produto encontrado com o ID ${validatedId}`
        });
      }
      
      const previousStock = product.stockQuantity;
      let newStock;
      
      if (type === 'IN') {
        newStock = previousStock + quantity;
      } else {
        if (previousStock < quantity) {
          return res.status(400).json({
            success: false,
            error: 'Estoque insuficiente',
            message: `Estoque atual (${previousStock}) é insuficiente para a saída de ${quantity} unidades`
          });
        }
        newStock = previousStock - quantity;
      }
      
      await product.update({ stockQuantity: newStock });
      
      res.json({
        success: true,
        message: `Estoque ${type === 'IN' ? 'adicionado' : 'removido'} com sucesso`,
        data: {
          productId: product.id,
          productName: product.name,
          previousStock,
          newStock,
          quantity,
          type
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;