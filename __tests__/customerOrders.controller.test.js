
const mongoose = require('mongoose');
const CustomerOrder = require('../models/CustomerOrder');
const ProductionOrder = require('../models/ProductionOrder');
const customerOrdersController = require('../controllers/customerOrders');

jest.mock('../models/CustomerOrder', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock('../models/ProductionOrder', () => ({
  create: jest.fn(),
  updateOne: jest.fn()
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

const PRODUCT_ID = '66f5a1b2c3d4e5f6a7b8c901';
const ORDER_ID = '66f5a1b2c3d4e5f6a7b8c904';
const PRODUCTION_ORDER_ID = '66f5a1b2c3d4e5f6a7b8c905';

const orderBody = {
  orderNumber: 'CO-2026-001',
  customerName: 'Acme Retail',
  customerEmail: 'orders@acmeretail.com',
  productId: PRODUCT_ID,
  quantity: 20
};

const makeOrderDoc = (fields = {}) => ({
  _id: ORDER_ID,
  ...orderBody,
  status: 'pending',
  save: jest.fn().mockResolvedValue(),
  ...fields
});

describe('Customer Orders controller', () => {
  
  let productsCollection;

  beforeEach(() => {
    productsCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn()
    };
    jest.spyOn(mongoose.connection, 'collection').mockReturnValue(productsCollection);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getAll', () => {
    test('returns 200 and the list of orders', async () => {
      CustomerOrder.find.mockResolvedValue([orderBody]);
      const res = mockResponse();

      await customerOrdersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([orderBody]);
    });

    test('returns 500 when the database fails', async () => {
      CustomerOrder.find.mockRejectedValue(new Error('DB down'));
      const res = mockResponse();

      await customerOrdersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSingle', () => {
    test('returns 200 and the order when it exists', async () => {
      CustomerOrder.findById.mockResolvedValue(orderBody);
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when the order does not exist', async () => {
      CustomerOrder.findById.mockResolvedValue(null);
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createCustomerOrder', () => {
    test('returns 404 when the product does not exist', async () => {
      productsCollection.findOne.mockResolvedValue(null);
      const req = { body: orderBody };
      const res = mockResponse();

      await customerOrdersController.createCustomerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(CustomerOrder.create).not.toHaveBeenCalled();
    });

    test('reserves stock and marks the order "ready" when there is enough stock', async () => {
      const orderDoc = makeOrderDoc();
      productsCollection.findOne.mockResolvedValue({ _id: PRODUCT_ID, quantityOnHand: 100 });
      productsCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      CustomerOrder.create.mockResolvedValue(orderDoc);
      const req = { body: orderBody };
      const res = mockResponse();

      await customerOrdersController.createCustomerOrder(req, res);

      expect(orderDoc.status).toBe('ready');
      expect(orderDoc.save).toHaveBeenCalled();
      expect(ProductionOrder.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('creates a production order and marks the order "in-production" when stock is short', async () => {
      const orderDoc = makeOrderDoc();
      productsCollection.findOne.mockResolvedValue({ _id: PRODUCT_ID, quantityOnHand: 5 });
      productsCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });
      CustomerOrder.create.mockResolvedValue(orderDoc);
      ProductionOrder.create.mockResolvedValue({ _id: PRODUCTION_ORDER_ID });
      const req = { body: orderBody };
      const res = mockResponse();

      await customerOrdersController.createCustomerOrder(req, res);

      expect(ProductionOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderNumber: 'PO-CO-2026-001',
          productId: PRODUCT_ID,
          quantityPlanned: 20,
          customerOrderId: ORDER_ID
        })
      );
      expect(orderDoc.status).toBe('in-production');
      expect(orderDoc.productionOrderId).toBe(PRODUCTION_ORDER_ID);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('returns 409 when the orderNumber already exists', async () => {
      productsCollection.findOne.mockResolvedValue({ _id: PRODUCT_ID, quantityOnHand: 100 });
      CustomerOrder.create.mockRejectedValue({ code: 11000 });
      const req = { body: orderBody };
      const res = mockResponse();

      await customerOrdersController.createCustomerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('rolls back the customer order when the production order number is a duplicate', async () => {
      const orderDoc = makeOrderDoc();
      productsCollection.findOne.mockResolvedValue({ _id: PRODUCT_ID, quantityOnHand: 5 });
      productsCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });
      CustomerOrder.create.mockResolvedValue(orderDoc);
      ProductionOrder.create.mockRejectedValue({ code: 11000 });
      const req = { body: orderBody };
      const res = mockResponse();

      await customerOrdersController.createCustomerOrder(req, res);

      expect(CustomerOrder.findByIdAndDelete).toHaveBeenCalledWith(ORDER_ID);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('updateCustomerOrder', () => {
    test('returns 200 and only updates customer fields', async () => {
      CustomerOrder.findByIdAndUpdate.mockResolvedValue(orderBody);
      // quantity is ignored: only customer information can change.
      const req = { params: { id: ORDER_ID }, body: { customerName: 'New Name', quantity: 999 } };
      const res = mockResponse();

      await customerOrdersController.updateCustomerOrder(req, res);

      expect(CustomerOrder.findByIdAndUpdate).toHaveBeenCalledWith(
        ORDER_ID,
        { customerName: 'New Name' },
        { runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when the order does not exist', async () => {
      CustomerOrder.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: ORDER_ID }, body: { customerName: 'New Name' } };
      const res = mockResponse();

      await customerOrdersController.updateCustomerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('shipCustomerOrder', () => {
    test('ships an order that is "ready"', async () => {
      const orderDoc = makeOrderDoc({ status: 'ready' });
      CustomerOrder.findById.mockResolvedValue(orderDoc);
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.shipCustomerOrder(req, res);

      expect(orderDoc.status).toBe('shipped');
      expect(orderDoc.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 409 when the order is not "ready"', async () => {
      const orderDoc = makeOrderDoc({ status: 'in-production' });
      CustomerOrder.findById.mockResolvedValue(orderDoc);
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.shipCustomerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(orderDoc.save).not.toHaveBeenCalled();
    });

    test('returns 404 when the order does not exist', async () => {
      CustomerOrder.findById.mockResolvedValue(null);
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.shipCustomerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteCustomerOrder', () => {
    test('returns the reserved stock when a "ready" order is deleted', async () => {
      CustomerOrder.findByIdAndDelete.mockResolvedValue(makeOrderDoc({ status: 'ready' }));
      productsCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.deleteCustomerOrder(req, res);

      expect(productsCollection.updateOne).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId(PRODUCT_ID) },
        { $inc: { quantityOnHand: 20 } }
      );
      expect(ProductionOrder.updateOne).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test('cancels the linked production order when an "in-production" order is deleted', async () => {
      CustomerOrder.findByIdAndDelete.mockResolvedValue(
        makeOrderDoc({ status: 'in-production', productionOrderId: PRODUCTION_ORDER_ID })
      );
      ProductionOrder.updateOne.mockResolvedValue({ modifiedCount: 1 });
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.deleteCustomerOrder(req, res);

      expect(ProductionOrder.updateOne).toHaveBeenCalledWith(
        { _id: PRODUCTION_ORDER_ID, status: { $in: ['planned', 'in-progress'] } },
        { status: 'cancelled' }
      );
      expect(productsCollection.updateOne).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test('returns 404 when the order does not exist', async () => {
      CustomerOrder.findByIdAndDelete.mockResolvedValue(null);
      const req = { params: { id: ORDER_ID } };
      const res = mockResponse();

      await customerOrdersController.deleteCustomerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
