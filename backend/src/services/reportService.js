const { sequelize, Product, Category, Movement, User } = require('../models');
const { Op } = require('sequelize');

class ReportService {
  static async getDashboardSummary() {
    try {
      const [
        totalProducts,
        totalCategories,
        totalStockQuantity,
        stockValueResult,
        lowStockCount,
        outOfStockCount,
        movementsToday,
        movementsThisMonth
      ] = await Promise.all([
        Product.count({ where: { isActive: true } }),
        Category.count(),
        Product.sum('stockQuantity', { where: { isActive: true } }),
        Product.findOne({
        attributes: [[sequelize.literal('SUM(price * stock_quantity)'), 'total']],
        where: { isActive: true },
        raw: true
      }),
        Product.count({
          where: {
            isActive: true,
            stockQuantity: {
              [Op.lte]: sequelize.col('min_stock')
            }
          }
        }),
        Product.count({
          where: {
            isActive: true,
            stockQuantity: 0
          }
        }),
        Movement.count({
          where: {
            created_at: {
              [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        Movement.count({
          where: {
            created_at: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      ]);
      
      return {
        products: {
          total: totalProducts || 0,
          lowStock: lowStockCount || 0,
          outOfStock: outOfStockCount || 0
        },
        categories: {
          total: totalCategories || 0
        },
        stock: {
          totalQuantity: totalStockQuantity || 0,
          totalValue: parseFloat(stockValueResult?.total || 0).toFixed(2)
        },
        movements: {
          today: movementsToday || 0,
          thisMonth: movementsThisMonth || 0
        },
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao obter dashboard summary:', error);
      throw error;
    }
  }

  static async getLowStockProducts(options = {}) {
    const { page = 1, limit = 20, minStockOnly = true } = options;
    const offset = (page - 1) * limit;
    
    const where = {
      isActive: true
    };
    
    if (minStockOnly) {
      where.stockQuantity = {
        [Op.lte]: sequelize.col('min_stock')
      };
    }
    
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'id',
        'name',
        'code',
        'price',
        'stockQuantity',
        'minStock'
      ],
      order: [['stockQuantity', 'ASC']],
      limit: parseInt(limit, 10),
      offset
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return {
      products: rows.map(p => ({
        ...p.toJSON(),
        difference: p.stockQuantity - p.minStock,
        status: p.stockQuantity === 0 ? 'CRITICAL' : 'WARNING'
      })),
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  static async getRecentMovements(options = {}) {
    const { limit = 20, type = null, productId = null } = options;
    
    const where = {};
    if (type) where.type = type;
    if (productId) where.productId = productId;
    
    const movements = await Movement.findAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'code', 'price']
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
    
    return movements.map(m => ({
      id: m.id,
      type: m.type,
      typeLabel: m.type === 'IN' ? 'Entrada' : (m.type === 'OUT' ? 'Saída' : 'Ajuste'),
      quantity: m.quantity,
      previousStock: m.previousStock,
      currentStock: m.currentStock,
      unitPrice: m.unitPrice,
      totalPrice: m.totalPrice,
      notes: m.notes,
      product: m.product ? {
        id: m.product.id,
        name: m.product.name,
        code: m.product.code
      } : null,
      user: m.user ? {
        id: m.user.id,
        name: m.user.name
      } : null,
      createdAt: m.createdAt
    }));
  }

  static async getMovementSummary(period = 'month') {
    let startDate;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const summary = await Movement.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'totalValue']
      ],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['type']
    });
    
    const result = {
      period: { start: startDate, end: endDate },
      movements: {
        IN: { count: 0, quantity: 0, value: 0 },
        OUT: { count: 0, quantity: 0, value: 0 },
        ADJUSTMENT: { count: 0, quantity: 0, value: 0 }
      }
    };
    
    summary.forEach(item => {
      const type = item.type;
      if (result.movements[type]) {
        result.movements[type] = {
          count: parseInt(item.dataValues.count),
          quantity: parseInt(item.dataValues.totalQuantity),
          value: parseFloat(item.dataValues.totalValue || 0).toFixed(2)
        };
      }
    });
    
    return result;
  }

  static async getMovementChart(days = 7) {
    const dates = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    
    const movements = await Movement.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        'type',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
      ],
      where: {
        created_at: {
          [Op.gte]: dates[0]
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at')), 'type'],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });
    
    const chartData = dates.map(date => ({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('pt-BR'),
      IN: 0,
      OUT: 0,
      ADJUSTMENT: 0
    }));
    
    movements.forEach(m => {
      const dateStr = m.dataValues.date.toISOString().split('T')[0];
      const dayData = chartData.find(d => d.date === dateStr);
      if (dayData && m.type) {
        dayData[m.type] = parseInt(m.dataValues.total);
      }
    });
    
    return chartData;
  }

  static async getTopProducts(limit = 10) {
    const topProducts = await Movement.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalMoved']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'code', 'price']
        }
      ],
      group: ['productId'],
      order: [[sequelize.literal('totalMoved'), 'DESC']],
      limit: parseInt(limit, 10)
    });
    
    return topProducts.map(p => ({
      productId: p.productId,
      productName: p.product?.name || 'Produto não encontrado',
      productCode: p.product?.code,
      totalMoved: parseInt(p.dataValues.totalMoved)
    }));
  }
}

module.exports = ReportService;

