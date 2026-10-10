const Product = require('../models/Product');
const productsController = require('../controllers/products');



// Replace the real Mongoose model with fake functions, so no database is needed.
jest.mock('../models/Product', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));



// Fake Express "res" object. The products controller ends DELETE with res.status(204).end().
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};



const sampleProduct = {
  _id: '66f5a1b2c3d4e5f6a7b8c901',
  sku: 'CHAIR-OAK-001',
  name: 'Oak Chair',
  description: 'Solid oak dining chair',
  unitOfMeasure: 'pcs',
  quantityOnHand: 25,
  reorderPoint: 5,
  unitPrice: 89.99,
  location: 'Warehouse-C-02',
  isActive: true
};



describe('Products controller', () => {
  afterEach(() => {
   jest.clearAllMocks();
  });



  describe('getAll', () => {
   test('returns 200 and the list of products', async () => {
     Product.find.mockResolvedValue([sampleProduct]);
     const res = mockResponse();



     await productsController.getAll({}, res);



     expect(res.status).toHaveBeenCalledWith(200);
     expect(res.json).toHaveBeenCalledWith([sampleProduct]);
   });



   test('returns 500 when the database fails', async () => {
     Product.find.mockRejectedValue(new Error('DB down'));
     const res = mockResponse();



     await productsController.getAll({}, res);



     expect(res.status).toHaveBeenCalledWith(500);
   });
  });



  describe('getSingle', () => {
   test('returns 200 and the product when it exists', async () => {
     Product.findById.mockResolvedValue(sampleProduct);
     const req = { params: { id: sampleProduct._id } };
     const res = mockResponse();



     await productsController.getSingle(req, res);



     expect(Product.findById).toHaveBeenCalledWith(sampleProduct._id);
     expect(res.status).toHaveBeenCalledWith(200);
     expect(res.json).toHaveBeenCalledWith(sampleProduct);
   });



   test('returns 404 when the product does not exist', async () => {
     Product.findById.mockResolvedValue(null);
     const req = { params: { id: sampleProduct._id } };
     const res = mockResponse();



     await productsController.getSingle(req, res);



     expect(res.status).toHaveBeenCalledWith(404);
   });



   test('returns 500 when the database fails', async () => {
     Product.findById.mockRejectedValue(new Error('DB down'));
     const req = { params: { id: sampleProduct._id } };
     const res = mockResponse();



     await productsController.getSingle(req, res);



     expect(res.status).toHaveBeenCalledWith(500);
   });
  });



  describe('createProduct', () => {
   test('returns 201 when the product is created', async () => {
     Product.create.mockResolvedValue(sampleProduct);
     const req = { body: sampleProduct };
     const res = mockResponse();



     await productsController.createProduct(req, res);



     expect(res.status).toHaveBeenCalledWith(201);
     expect(res.json).toHaveBeenCalledWith({ message: 'Product created successfully.', data: sampleProduct });
   });



   test('returns 409 when the sku already exists', async () => {
     Product.create.mockRejectedValue({ code: 11000 });
     const req = { body: sampleProduct };
     const res = mockResponse();



     await productsController.createProduct(req, res);



     expect(res.status).toHaveBeenCalledWith(409);
   });



   test('returns 500 when the database fails', async () => {
     Product.create.mockRejectedValue(new Error('DB down'));
     const req = { body: sampleProduct };
     const res = mockResponse();



     await productsController.createProduct(req, res);



     expect(res.status).toHaveBeenCalledWith(500);
   });
  });



  describe('updateProduct', () => {
   test('returns 200 and the updated product', async () => {
     const updated = { ...sampleProduct, quantityOnHand: 30 };
     Product.findByIdAndUpdate.mockResolvedValue(updated);
     const req = { params: { id: sampleProduct._id }, body: { quantityOnHand: 30 } };
     const res = mockResponse();



     await productsController.updateProduct(req, res);



     expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
       sampleProduct._id,
       { quantityOnHand: 30 },
       { new: true, runValidators: true }
     );
     expect(res.status).toHaveBeenCalledWith(200);
     expect(res.json).toHaveBeenCalledWith({ message: 'Product updated successfully.', data: updated });
   });



   test('returns 404 when the product does not exist', async () => {
     Product.findByIdAndUpdate.mockResolvedValue(null);
     const req = { params: { id: sampleProduct._id }, body: { quantityOnHand: 30 } };
     const res = mockResponse();



     await productsController.updateProduct(req, res);



     expect(res.status).toHaveBeenCalledWith(404);
   });



   test('returns 409 when the new sku is already used', async () => {
     Product.findByIdAndUpdate.mockRejectedValue({ code: 11000 });
     const req = { params: { id: sampleProduct._id }, body: { sku: 'CHAIR-OAK-002' } };
     const res = mockResponse();



     await productsController.updateProduct(req, res);



     expect(res.status).toHaveBeenCalledWith(409);
   });
  });



  describe('deleteProduct', () => {
   test('returns 204 when the product is deleted', async () => {
     Product.findByIdAndDelete.mockResolvedValue(sampleProduct);
     const req = { params: { id: sampleProduct._id } };
     const res = mockResponse();



     await productsController.deleteProduct(req, res);



     expect(res.status).toHaveBeenCalledWith(204);
     expect(res.end).toHaveBeenCalled();
   });



   test('returns 404 when the product does not exist', async () => {
     Product.findByIdAndDelete.mockResolvedValue(null);
     const req = { params: { id: sampleProduct._id } };
     const res = mockResponse();



     await productsController.deleteProduct(req, res);



     expect(res.status).toHaveBeenCalledWith(404);
     expect(res.end).not.toHaveBeenCalled();
   });
  });
});
 