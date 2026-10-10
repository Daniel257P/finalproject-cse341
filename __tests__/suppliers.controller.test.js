const Supplier = require('../models/Supplier');
const suppliersController = require('../controllers/suppliers');

// Replace the real Mongoose model with fake functions, so no database is needed.
jest.mock('../models/Supplier', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

// Fake Express "res" object. The suppliers controller ends DELETE with res.status(204).end().
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

const sampleSupplier = {
  _id: '66f5a1b2c3d4e5f6a7b8c906',
  supplierCode: 'SUP-001',
  name: 'Acme Lumber',
  contactName: 'Ann Smith',
  email: 'ann@acmelumber.com',
  phone: '555-0100',
  address: '100 Main St, Springfield',
  isActive: true
};

describe('Suppliers controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('returns 200 and the list of suppliers', async () => {
      Supplier.find.mockResolvedValue([sampleSupplier]);
      const res = mockResponse();

      await suppliersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([sampleSupplier]);
    });

    test('returns 500 when the database fails', async () => {
      Supplier.find.mockRejectedValue(new Error('DB down'));
      const res = mockResponse();

      await suppliersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSingle', () => {
    test('returns 200 and the supplier when it exists', async () => {
      Supplier.findById.mockResolvedValue(sampleSupplier);
      const req = { params: { id: sampleSupplier._id } };
      const res = mockResponse();

      await suppliersController.getSingle(req, res);

      expect(Supplier.findById).toHaveBeenCalledWith(sampleSupplier._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sampleSupplier);
    });

    test('returns 404 when the supplier does not exist', async () => {
      Supplier.findById.mockResolvedValue(null);
      const req = { params: { id: sampleSupplier._id } };
      const res = mockResponse();

      await suppliersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 500 when the database fails', async () => {
      Supplier.findById.mockRejectedValue(new Error('DB down'));
      const req = { params: { id: sampleSupplier._id } };
      const res = mockResponse();

      await suppliersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createSupplier', () => {
    test('returns 201 when the supplier is created', async () => {
      Supplier.create.mockResolvedValue(sampleSupplier);
      const req = { body: sampleSupplier };
      const res = mockResponse();

      await suppliersController.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Supplier created successfully.', data: sampleSupplier });
    });

    test('returns 409 when the supplierCode already exists', async () => {
      Supplier.create.mockRejectedValue({ code: 11000 });
      const req = { body: sampleSupplier };
      const res = mockResponse();

      await suppliersController.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('returns 500 when the database fails', async () => {
      Supplier.create.mockRejectedValue(new Error('DB down'));
      const req = { body: sampleSupplier };
      const res = mockResponse();

      await suppliersController.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateSupplier', () => {
    test('returns 200 and the updated supplier', async () => {
      const updated = { ...sampleSupplier, phone: '555-0199' };
      Supplier.findByIdAndUpdate.mockResolvedValue(updated);
      const req = { params: { id: sampleSupplier._id }, body: { phone: '555-0199' } };
      const res = mockResponse();

      await suppliersController.updateSupplier(req, res);

      expect(Supplier.findByIdAndUpdate).toHaveBeenCalledWith(
        sampleSupplier._id,
        { phone: '555-0199' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Supplier updated successfully.', data: updated });
    });

    test('returns 404 when the supplier does not exist', async () => {
      Supplier.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: sampleSupplier._id }, body: { phone: '555-0199' } };
      const res = mockResponse();

      await suppliersController.updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 409 when the new supplierCode is already used', async () => {
      Supplier.findByIdAndUpdate.mockRejectedValue({ code: 11000 });
      const req = { params: { id: sampleSupplier._id }, body: { supplierCode: 'SUP-002' } };
      const res = mockResponse();

      await suppliersController.updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('deleteSupplier', () => {
    test('returns 204 when the supplier is deleted', async () => {
      Supplier.findByIdAndDelete.mockResolvedValue(sampleSupplier);
      const req = { params: { id: sampleSupplier._id } };
      const res = mockResponse();

      await suppliersController.deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    test('returns 404 when the supplier does not exist', async () => {
      Supplier.findByIdAndDelete.mockResolvedValue(null);
      const req = { params: { id: sampleSupplier._id } };
      const res = mockResponse();

      await suppliersController.deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.end).not.toHaveBeenCalled();
    });
  });
});
 