const ReportService = require('../services/reportService');

const reportController = {
  /**
   * Dashboard principal
   * GET /api/reports/dashboard
   */
  async getDashboardSummary(req, res, next) {
    try {
      const data = await ReportService.getDashboardSummary();
      
      res.json({
        success: true,
        data
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Produtos com estoque baixo
   * GET /api/reports/low-stock
   */
  async getLowStockProducts(req, res, next) {
    try {
      const { page = 1, limit = 20, all = false } = req.query;
      
      const data = await ReportService.getLowStockProducts({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        minStockOnly: all !== 'true'
      });
      
      res.json({
        success: true,
        data
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Últimas movimentações
   * GET /api/reports/recent-movements
   */
  async getRecentMovements(req, res, next) {
    try {
      const { limit = 20, type, productId } = req.query;
      
      const data = await ReportService.getRecentMovements({
        limit: parseInt(limit, 10),
        type,
        productId
      });
      
      res.json({
        success: true,
        data
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resumo de movimentações por período
   * GET /api/reports/movement-summary
   */
  async getMovementSummary(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      
      const data = await ReportService.getMovementSummary(period);
      
      res.json({
        success: true,
        data
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Dados para gráfico de movimentações
   * GET /api/reports/movement-chart
   */
  async getMovementChart(req, res, next) {
    try {
      const { days = 7 } = req.query;
      
      const data = await ReportService.getMovementChart(parseInt(days, 10));
      
      res.json({
        success: true,
        data
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Top produtos mais movimentados
   * GET /api/reports/top-products
   */
  async getTopProducts(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      
      const data = await ReportService.getTopProducts(parseInt(limit, 10));
      
      res.json({
        success: true,
        data
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportController;