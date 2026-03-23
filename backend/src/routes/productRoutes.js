const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { handleSingleUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * Todas as rotas de produtos exigem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/products
 * @desc    Listar todos os produtos
 * @access  Private
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/low-stock
 * @desc    Listar produtos com estoque baixo
 * @access  Private
 */
router.get('/low-stock', productController.getLowStockProducts);

/**
 * @route   GET /api/products/code/:code
 * @desc    Buscar produto por código
 * @access  Private
 */
router.get('/code/:code', productController.getProductByCode);

/**
 * @route   POST /api/products
 * @desc    Criar novo produto
 * @access  Private (admin/manager)
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  productController.createProduct
);

/**
 * @route   POST /api/products/:id/image
 * @desc    Upload de imagem do produto
 * @access  Private (admin/manager)
 */
router.post(
  '/:id/image',
  authorize('admin', 'manager'),
  handleSingleUpload('image'),
  productController.uploadProductImage
);

/**
 * @route   DELETE /api/products/:id/image
 * @desc    Remover imagem do produto
 * @access  Private (admin/manager)
 */
router.delete(
  '/:id/image',
  authorize('admin', 'manager'),
  productController.deleteProductImage
);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Atualizar estoque do produto
 * @access  Private (admin/manager/operator)
 */
router.patch(
  '/:id/stock',
  authorize('admin', 'manager', 'operator'),
  productController.updateStock
);

/**
 * @route   PUT /api/products/:id
 * @desc    Atualizar produto
 * @access  Private (admin/manager)
 */
router.put(
  '/:id',
  authorize('admin', 'manager'),
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Remover produto (soft delete)
 * @access  Private (admin)
 */
router.delete(
  '/:id',
  authorize('admin'),
  productController.deleteProduct
);

/**
 * @route   GET /api/products/:id
 * @desc    Buscar produto por ID
 * @access  Private
 */
router.get('/:id', productController.getProductById);

module.exports = router;