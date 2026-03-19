const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { categorySchema, categoryUpdateSchema } = require('../validations/categoryValidation');

const router = express.Router();

/**
 * Todas as rotas de categorias exigem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/categories
 * @desc    Listar todas as categorias (com filtros e paginação)
 * @access  Private
 */
router.get('/', categoryController.list);

/**
 * @route   GET /api/categories/with-count
 * @desc    Listar categorias com contagem de produtos
 * @access  Private (apenas admin/manager)
 */
router.get(
  '/with-count',
  authorize('admin', 'manager'),
  categoryController.listWithProductCount
);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Buscar categoria por slug
 * @access  Private
 */
router.get('/slug/:slug', categoryController.getBySlug);

/**
 * @route   GET /api/categories/:id
 * @desc    Buscar categoria por ID
 * @access  Private
 */
router.get('/:id', categoryController.getById);

/**
 * @route   POST /api/categories
 * @desc    Criar nova categoria
 * @access  Private (apenas admin/manager)
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  validateRequest(categorySchema),
  categoryController.create
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Atualizar categoria existente
 * @access  Private (apenas admin/manager)
 */
router.put(
  '/:id',
  authorize('admin', 'manager'),
  validateRequest(categoryUpdateSchema),
  categoryController.update
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Remover categoria
 * @access  Private (apenas admin)
 */
router.delete(
  '/:id',
  authorize('admin'),
  categoryController.delete
);

module.exports = router;