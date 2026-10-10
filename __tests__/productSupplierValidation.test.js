const { saveProduct } = require('../middleware/validateProduct');
const { saveSupplier } = require('../middleware/validateSupplier');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Runs a validation middleware and reports whether it let the request through.
const runValidation = (middleware, body) => {
  const req = { body };
  const res = mockResponse();
  const next = jest.fn();
  middleware(req, res, next);
  return { res, next };
};

describe('saveProduct validation', () => {
  const validProduct = {
    sku: 'CHAIR-OAK-001',
    name: 'Oak Chair',
    description: 'Solid oak dining chair',
    unitOfMeasure: 'pcs',
    quantityOnHand: 25,
    reorderPoint: 5,
    unitPrice: 89.99,
    isActive: true
  };

  test('calls next() when the body is valid', () => {
    const { next } = runValidation(saveProduct, validProduct);

    expect(next).toHaveBeenCalled();
  });

  test('returns 400 when a required field is missing', () => {
    const { sku, ...productWithoutSku } = validProduct;
    const { res, next } = runValidation(saveProduct, productWithoutSku);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when unitOfMeasure is not allowed', () => {
    const { res, next } = runValidation(saveProduct, { ...validProduct, unitOfMeasure: 'banana' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when unitPrice is negative', () => {
    const { res, next } = runValidation(saveProduct, { ...validProduct, unitPrice: -5 });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when quantityOnHand is not a number', () => {
    const { res, next } = runValidation(saveProduct, { ...validProduct, quantityOnHand: 'many' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('saveSupplier validation', () => {
  const validSupplier = {
    supplierCode: 'SUP-001',
    name: 'Acme Lumber',
    contactName: 'Ann Smith',
    email: 'ann@acmelumber.com',
    phone: '555-0100',
    address: '100 Main St, Springfield',
    isActive: true
  };

  test('calls next() when the body is valid', () => {
    const { next } = runValidation(saveSupplier, validSupplier);

    expect(next).toHaveBeenCalled();
  });

  test('returns 400 when a required field is missing', () => {
    const { supplierCode, ...supplierWithoutCode } = validSupplier;
    const { res, next } = runValidation(saveSupplier, supplierWithoutCode);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when the email is invalid', () => {
    const { res, next } = runValidation(saveSupplier, { ...validSupplier, email: 'not-an-email' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when isActive is not a boolean', () => {
    const { res, next } = runValidation(saveSupplier, { ...validSupplier, isActive: 'maybe' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
 