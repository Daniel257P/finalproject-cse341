const Material = require('../models/Material');
const materialsController = require('../controllers/materials');

jest.mock('../models/Material', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

const sampleMaterial = {
  _id: '66f5a1b2c3d4e5f6a7b8c901',
  sku: 'PAINT-WHT-20L',
  name: 'White Emulsion Paint',
  description: '20 liter bucket of white paint',
  unitOfMeasure: 'liters',
  quantityOnHand: 40,
  reorderPoint: 10,
  unitCost: 35.99
};

describe('Materials controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('returns 200 and the list of materials', async () => {
      Material.find.mockResolvedValue([sampleMaterial]);
      const res = mockResponse();

      await materialsController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([sampleMaterial]);
    });

    test('returns 500 when the database fails', async () => {
      Material.find.mockRejectedValue(new Error('DB down'));
      const res = mockResponse();

      await materialsController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSingle', () => {
    test('returns 200 and the material when it exists', async () => {
      Material.findById.mockResolvedValue(sampleMaterial);
      const req = { params: { id: sampleMaterial._id } };
      const res = mockResponse();

      await materialsController.getSingle(req, res);

      expect(Material.findById).toHaveBeenCalledWith(sampleMaterial._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sampleMaterial);
    });

    test('returns 404 when the material does not exist', async () => {
      Material.findById.mockResolvedValue(null);
      const req = { params: { id: sampleMaterial._id } };
      const res = mockResponse();

      await materialsController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createMaterial', () => {
    test('returns 201 when the material is created', async () => {
      Material.create.mockResolvedValue(sampleMaterial);
      const req = { body: sampleMaterial };
      const res = mockResponse();

      await materialsController.createMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Material created successfully', data: sampleMaterial });
    });

    test('returns 409 when the sku already exists', async () => {
      Material.create.mockRejectedValue({ code: 11000 });
      const req = { body: sampleMaterial };
      const res = mockResponse();

      await materialsController.createMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('updateMaterial', () => {
    test('returns 200 when the material is updated', async () => {
      Material.findByIdAndUpdate.mockResolvedValue(sampleMaterial);
      const req = { params: { id: sampleMaterial._id }, body: { quantityOnHand: 50 } };
      const res = mockResponse();

      await materialsController.updateMaterial(req, res);

      expect(Material.findByIdAndUpdate).toHaveBeenCalledWith(
        sampleMaterial._id,
        { quantityOnHand: 50 },
        { runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when the material does not exist', async () => {
      Material.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: sampleMaterial._id }, body: { quantityOnHand: 50 } };
      const res = mockResponse();

      await materialsController.updateMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteMaterial', () => {
    test('returns 204 when the material is deleted', async () => {
      Material.findByIdAndDelete.mockResolvedValue(sampleMaterial);
      const req = { params: { id: sampleMaterial._id } };
      const res = mockResponse();

      await materialsController.deleteMaterial(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test('returns 404 when the material does not exist', async () => {
      Material.findByIdAndDelete.mockResolvedValue(null);
      const req = { params: { id: sampleMaterial._id } };
      const res = mockResponse();

      await materialsController.deleteMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

describe('getLowStock', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 200 and the materials at or below their reorder point', async () => {
    Material.find.mockResolvedValue([sampleMaterial]);
    const res = mockResponse();

    await materialsController.getLowStock({}, res);

    expect(Material.find).toHaveBeenCalledWith({ $expr: { $lte: ['$quantityOnHand', '$reorderPoint'] } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([sampleMaterial]);
  });

  test('returns 500 when the database fails', async () => {
    Material.find.mockRejectedValue(new Error('DB down'));
    const res = mockResponse();

    await materialsController.getLowStock({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
