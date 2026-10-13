const Material = require('../models/Material');
const Product = require('../models/Product');
const materialsController = require('../controllers/materials');
const productsController = require('../controllers/products');
const restockValidation = require('../middleware/validateRestock');

// Replace the real Mongoose models with fake functions, so no database is needed.
jest.mock('../models/Material', () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../models/Product', () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const MATERIAL_ID = '66f5a1b2c3d4e5f6a7b8c901';
const PRODUCT_ID = '66f5a1b2c3d4e5f6a7b8c902';

const LOW_STOCK_FILTER = { $expr: { $lte: ['$quantityOnHand', '$reorderPoint'] } };

describe('Low Stock', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('products getLowStock', () => {
    test('returns 200 and the products at or below their reorder point', async () => {
      const lowProduct = { _id: PRODUCT_ID, sku: 'PROD-006', quantityOnHand: 5, reorderPoint: 10 };
      Product.find.mockResolvedValue([lowProduct]);
      const res = mockResponse();

      await productsController.getLowStock({}, res);

      expect(Product.find).toHaveBeenCalledWith(LOW_STOCK_FILTER);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([lowProduct]);
    });

    test('returns 500 when the database fails', async () => {
      Product.find.mockRejectedValue(new Error('DB down'));
      const res = mockResponse();

      await productsController.getLowStock({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('restockMaterial', () => {
    test('adds the received quantity and updates lastReceivedDate', async () => {
      const restocked = { _id: MATERIAL_ID, quantityOnHand: 90 };
      Material.findByIdAndUpdate.mockResolvedValue(restocked);
      const req = { params: { id: MATERIAL_ID }, body: { quantity: 50 } };
      const res = mockResponse();

      await materialsController.restockMaterial(req, res);

      expect(Material.findByIdAndUpdate).toHaveBeenCalledWith(
        MATERIAL_ID,
        { $inc: { quantityOnHand: 50 }, lastReceivedDate: expect.any(Date) },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Material restocked successfully', data: restocked });
    });

    test('returns 404 when the material does not exist', async () => {
      Material.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: MATERIAL_ID }, body: { quantity: 50 } };
      const res = mockResponse();

      await materialsController.restockMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 500 when the database fails', async () => {
      Material.findByIdAndUpdate.mockRejectedValue(new Error('DB down'));
      const req = { params: { id: MATERIAL_ID }, body: { quantity: 50 } };
      const res = mockResponse();

      await materialsController.restockMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('restockProduct', () => {
    test('adds the received quantity to quantityOnHand', async () => {
      const restocked = { _id: PRODUCT_ID, quantityOnHand: 55 };
      Product.findByIdAndUpdate.mockResolvedValue(restocked);
      // A quantity sent as text is converted to a number before $inc.
      const req = { params: { id: PRODUCT_ID }, body: { quantity: '50' } };
      const res = mockResponse();

      await productsController.restockProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        PRODUCT_ID,
        { $inc: { quantityOnHand: 50 } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product restocked successfully.', data: restocked });
    });

    test('returns 404 when the product does not exist', async () => {
      Product.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: PRODUCT_ID }, body: { quantity: 50 } };
      const res = mockResponse();

      await productsController.restockProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('restock validation', () => {
    const runValidation = (body) => {
      const res = mockResponse();
      const next = jest.fn();
      restockValidation.restock({ body }, res, next);
      return { res, next };
    };

    test('calls next() for a positive whole quantity', () => {
      const { next } = runValidation({ quantity: 50 });

      expect(next).toHaveBeenCalled();
    });

    test.each([
      ['missing', {}],
      ['zero', { quantity: 0 }],
      ['negative', { quantity: -5 }],
      ['decimal', { quantity: 2.5 }],
      ['text', { quantity: 'abc' }]
    ])('returns 400 when quantity is %s', (_label, body) => {
      const { res, next } = runValidation(body);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
