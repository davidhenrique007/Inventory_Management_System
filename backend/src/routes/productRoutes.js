const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Todas as rotas de produtos exigem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/products
 * @desc    Listar todos os produtos (com filtros e paginação)
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
 * @desc    Buscar produto por código de barras
 * @access  Private
 */
router.get('/code/:code', productController.getProductByCode);

/**
 * @route   GET /api/products/:id
 * @desc    Buscar produto por ID
 * @access  Private
 */
router.get('/:id', productController.getProductById);

module.exports = router;