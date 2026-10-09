const ProductionOrder = require('../models/ProductionOrder');
const productionOrdersController = require('../controllers/productionOrders');

// Replace the real Mongoose model with fake functions, so no database is needed.
jest.mock('../models/ProductionOrder', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

//Fake response object to simulate Express.js res object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

const sampleOrder = {
  _id: '66f5a1b2c3d4e5f6a7b8c903',
  orderNumber: 'PO-1001',
  productId: '507f1f77bcf86cd799439011',
  quantityPlanned: 100,
  quantityProduced: 0,
  status: 'planned',
  startDate: '2026-10-05'
};

describe('Production Orders controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('returns 200 and the list of production orders', async () => {
      ProductionOrder.find.mockResolvedValue([sampleOrder]);
      const res = mockResponse();

      await productionOrdersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([sampleOrder]);
    });

    test('returns 500 when the database fails', async () => {
      ProductionOrder.find.mockRejectedValue(new Error('DB down'));
      const res = mockResponse();

      await productionOrdersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSingle', () => {
    test('returns 200 and the order when it exists', async () => {
      ProductionOrder.findById.mockResolvedValue(sampleOrder);
      const req = { params: { id: sampleOrder._id } };
      const res = mockResponse();

      await productionOrdersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sampleOrder);
    });

    test('returns 404 when the order does not exist', async () => {
      ProductionOrder.findById.mockResolvedValue(null);
      const req = { params: { id: sampleOrder._id } };
      const res = mockResponse();

      await productionOrdersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createProductionOrder', () => {
    test('returns 201 when the order is created', async () => {
      ProductionOrder.create.mockResolvedValue(sampleOrder);
      const req = { body: sampleOrder };
      const res = mockResponse();

      await productionOrdersController.createProductionOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Production order created successfully', data: sampleOrder });
    });

    test('returns 409 when the orderNumber already exists', async () => {
      ProductionOrder.create.mockRejectedValue({ code: 11000 });
      const req = { body: sampleOrder };
      const res = mockResponse();

      await productionOrdersController.createProductionOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('updateProductionOrder', () => {
    test('returns 200 when the order is updated', async () => {
      ProductionOrder.findByIdAndUpdate.mockResolvedValue(sampleOrder);
      const req = { params: { id: sampleOrder._id }, body: { status: 'in-progress' } };
      const res = mockResponse();

      await productionOrdersController.updateProductionOrder(req, res);

      expect(ProductionOrder.findByIdAndUpdate).toHaveBeenCalledWith(
        sampleOrder._id,
        { status: 'in-progress' },
        { runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when the order does not exist', async () => {
      ProductionOrder.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: sampleOrder._id }, body: { status: 'in-progress' } };
      const res = mockResponse();

      await productionOrdersController.updateProductionOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 409 when the new orderNumber is already used', async () => {
      ProductionOrder.findByIdAndUpdate.mockRejectedValue({ code: 11000 });
      const req = { params: { id: sampleOrder._id }, body: { orderNumber: 'PO-1002' } };
      const res = mockResponse();

      await productionOrdersController.updateProductionOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('deleteProductionOrder', () => {
    test('returns 204 when the order is deleted', async () => {
      ProductionOrder.findByIdAndDelete.mockResolvedValue(sampleOrder);
      const req = { params: { id: sampleOrder._id } };
      const res = mockResponse();

      await productionOrdersController.deleteProductionOrder(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test('returns 404 when the order does not exist', async () => {
      ProductionOrder.findByIdAndDelete.mockResolvedValue(null);
      const req = { params: { id: sampleOrder._id } };
      const res = mockResponse();

      await productionOrdersController.deleteProductionOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
