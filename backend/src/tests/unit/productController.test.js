const productController = require('../../controllers/productController');
const { Product } = require('../../models');

jest.mock('../../models', () => ({
  Product: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  Category: {}
}));

describe('Product Controller - Testes Unitários', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('Deve listar produtos com paginação', async () => {
      const mockProducts = {
        count: 2,
        rows: [
          { id: '1', name: 'Produto 1', code: 'P001' },
          { id: '2', name: 'Produto 2', code: 'P002' }
        ]
      };
      
      Product.findAndCountAll.mockResolvedValue(mockProducts);
      
      req.query = { page: 1, limit: 10 };
      await productController.getAllProducts(req, res, next);
      
      expect(Product.findAndCountAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          products: mockProducts.rows,
          pagination: expect.objectContaining({
            total: 2,
            page: 1,
            limit: 10
          })
        }
      });
    });

    it('Deve aplicar filtro por categoria', async () => {
      const mockProducts = { count: 0, rows: [] };
      Product.findAndCountAll.mockResolvedValue(mockProducts);
      
      req.query = { category: '123e4567-e89b-12d3-a456-426614174000' };
      await productController.getAllProducts(req, res, next);
      
      expect(Product.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: req.query.category
          })
        })
      );
    });

    it('Deve aplicar filtro por código', async () => {
      const mockProducts = { count: 0, rows: [] };
      Product.findAndCountAll.mockResolvedValue(mockProducts);
      
      req.query = { code: 'P001' };
      await productController.getAllProducts(req, res, next);
      
      expect(Product.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            code: expect.any(Object)
          })
        })
      );
    });
  });

  describe('getProductById', () => {
    it('Deve retornar produto quando encontrado', async () => {
      const mockProduct = { id: '1', name: 'Produto Teste', code: 'P001' };
      Product.findByPk.mockResolvedValue(mockProduct);
      
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      await productController.getProductById(req, res, next);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct
      });
    });

    it('Deve retornar 404 quando produto não encontrado', async () => {
      Product.findByPk.mockResolvedValue(null);
      
      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      await productController.getProductById(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Produto não encontrado',
        message: expect.stringContaining('nenhum produto encontrado')
      });
    });
  });

  describe('getProductByCode', () => {
    it('Deve retornar produto por código', async () => {
      const mockProduct = { id: '1', name: 'Produto Teste', code: 'P001' };
      Product.findOne.mockResolvedValue(mockProduct);
      
      req.params = { code: 'P001' };
      await productController.getProductByCode(req, res, next);
      
      expect(Product.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'P001' }
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct
      });
    });

    it('Deve retornar 404 para código inexistente', async () => {
      Product.findOne.mockResolvedValue(null);
      
      req.params = { code: 'INVALIDO' };
      await productController.getProductByCode(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});