const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Todas as rotas de relatórios exigem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Obter resumo do dashboard
 * @access  Private
 */
router.get('/dashboard', reportController.getDashboardSummary);

/**
 * @route   GET /api/reports/low-stock
 * @desc    Listar produtos com estoque baixo
 * @access  Private
 */
router.get('/low-stock', reportController.getLowStockProducts);

/**
 * @route   GET /api/reports/recent-movements
 * @desc    Listar últimas movimentações
 * @access  Private
 */
router.get('/recent-movements', reportController.getRecentMovements);

/**
 * @route   GET /api/reports/movement-summary
 * @desc    Resumo de movimentações por período
 * @access  Private (admin/manager)
 */
router.get(
  '/movement-summary',
  authorize('admin', 'manager'),
  reportController.getMovementSummary
);

/**
 * @route   GET /api/reports/movement-chart
 * @desc    Dados para gráfico de movimentações
 * @access  Private
 */
router.get('/movement-chart', reportController.getMovementChart);

/**
 * @route   GET /api/reports/top-products
 * @desc    Top produtos mais movimentados
 * @access  Private (admin/manager)
 */
router.get(
  '/top-products',
  authorize('admin', 'manager'),
  reportController.getTopProducts
);

module.exports = router;