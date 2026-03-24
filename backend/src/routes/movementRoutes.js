const express = require('express');
const movementController = require('../controllers/movementController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Todas as rotas de movimentação exigem autenticação
 */
router.use(authenticate);

/**
 * @route   POST /api/movements/entry
 * @desc    Registrar entrada de estoque
 * @access  Private (admin/manager/operator)
 */
router.post(
  '/entry',
  authorize('admin', 'manager', 'operator'),
  movementController.createEntryMovement
);

/**
 * @route   POST /api/movements/exit
 * @desc    Registrar saída de estoque
 * @access  Private (admin/manager/operator)
 */
router.post(
  '/exit',
  authorize('admin', 'manager', 'operator'),
  movementController.createExitMovement
);

/**
 * @route   POST /api/movements/adjustment
 * @desc    Ajuste manual de estoque
 * @access  Private (admin/manager)
 */
router.post(
  '/adjustment',
  authorize('admin', 'manager'),
  movementController.createAdjustmentMovement
);

/**
 * @route   GET /api/movements/product/:productId
 * @desc    Histórico de movimentações por produto
 * @access  Private
 */
router.get(
  '/product/:productId',
  movementController.getProductMovements
);

/**
 * @route   GET /api/movements/summary
 * @desc    Resumo de movimentações por período
 * @access  Private (admin/manager)
 */
router.get(
  '/summary',
  authorize('admin', 'manager'),
  movementController.getMovementSummary
);

/**
 * @route   GET /api/movements/recent
 * @desc    Últimas movimentações do sistema
 * @access  Private
 */
router.get(
  '/recent',
  movementController.getRecentMovements
);

module.exports = router;