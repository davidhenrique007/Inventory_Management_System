const { Category } = require('../models');
const { Op } = require('sequelize');

const categoryController = {
  /**
   * Listar todas as categorias com paginação e filtros
   * GET /api/categories
   */
  async list(req, res, next) {
    try {
      const { page = 1, limit = 10, name, sortBy = 'name', order = 'ASC' } = req.query;

      // Configurar paginação
      const offset = (page - 1) * limit;
      const parsedLimit = parseInt(limit, 10);

      // Construir filtros
      const where = {};
      
      if (name) {
        where.name = {
          [Op.like]: `%${name}%`
        };
      }

      // Buscar categorias
      const { count, rows } = await Category.findAndCountAll({
        where,
        limit: parsedLimit,
        offset,
        order: [[sortBy, order]],
        attributes: ['id', 'name', 'slug', 'description', 'createdAt', 'updatedAt']
      });

      // Calcular total de páginas
      const totalPages = Math.ceil(count / parsedLimit);

      res.json({
        success: true,
        data: {
          categories: rows,
          pagination: {
            total: count,
            page: parseInt(page, 10),
            limit: parsedLimit,
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
   * Buscar categoria por ID
   * GET /api/categories/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id, {
        attributes: ['id', 'name', 'slug', 'description', 'createdAt', 'updatedAt']
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada',
          message: `Nenhuma categoria encontrada com o ID ${id}`
        });
      }

      res.json({
        success: true,
        data: category
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Criar nova categoria
   * POST /api/categories
   */
  async create(req, res, next) {
    try {
      const { name, description } = req.body;

      // Verificar se categoria já existe
      const existingCategory = await Category.findOne({ 
        where: { name } 
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          message: 'Já existe uma categoria com este nome'
        });
      }

      // Criar categoria
      const category = await Category.create({
        name,
        description
      });

      res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: category.createdAt
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Atualizar categoria existente
   * PUT /api/categories/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Buscar categoria
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada',
          message: `Nenhuma categoria encontrada com o ID ${id}`
        });
      }

      // Se estiver alterando o nome, verificar duplicidade
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({
          where: { name }
        });

        if (existingCategory) {
          return res.status(409).json({
            success: false,
            error: 'Conflito',
            message: 'Já existe outra categoria com este nome'
          });
        }
      }

      // Atualizar campos
      if (name) category.name = name;
      if (description !== undefined) category.description = description;

      await category.save();

      res.json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          updatedAt: category.updatedAt
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Remover categoria
   * DELETE /api/categories/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Buscar categoria
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada',
          message: `Nenhuma categoria encontrada com o ID ${id}`
        });
      }

      // Verificar se existem produtos vinculados
      const productCount = await category.countProducts();
      
      if (productCount > 0) {
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          message: `Não é possível excluir: existem ${productCount} produto(s) vinculado(s) a esta categoria`
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Categoria removida com sucesso',
        data: { id }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Buscar categoria por slug
   * GET /api/categories/slug/:slug
   */
  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const category = await Category.findOne({
        where: { slug }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada',
          message: `Nenhuma categoria encontrada com o slug ${slug}`
        });
      }

      res.json({
        success: true,
        data: category
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Listar categorias com contagem de produtos
   * GET /api/categories/with-count
   */
  async listWithProductCount(req, res, next) {
    try {
      const categories = await Category.findAll({
        attributes: {
          include: [
            [
              sequelize.fn('COUNT', sequelize.col('products.id')),
              'productCount'
            ]
          ]
        },
        include: [{
          model: Product,
          as: 'products',
          attributes: [],
          required: false
        }],
        group: ['Category.id'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;