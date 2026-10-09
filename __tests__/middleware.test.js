const validateId = require('../middleware/validateId');
const { isAuthenticated } = require('../middleware/authenticate');
const { saveMaterial } = require('../middleware/validateMaterial');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validateId', () => {
  test('calls next() when the id is a valid ObjectId', () => {
    const req = { params: { id: '66f5a1b2c3d4e5f6a7b8c901' } };
    const res = mockResponse();
    const next = jest.fn();

    validateId(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 400 when the id is invalid', () => {
    const req = { params: { id: 'abc123' } };
    const res = mockResponse();
    const next = jest.fn();

    validateId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('isAuthenticated', () => {
  test('calls next() when the user is logged in', () => {
    const req = { session: { user: { username: 'daniel' } } };
    const res = mockResponse();
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('returns 401 when the user is not logged in', () => {
    const req = { session: {} };
    const res = mockResponse();
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('saveMaterial validation', () => {
  const validBody = {
    sku: 'PAINT-WHT-20L',
    name: 'White Emulsion Paint',
    description: '20 liter bucket of white paint',
    unitOfMeasure: 'liters',
    unitCost: 35.99
  };

  test('calls next() when the body is valid', () => {
    const req = { body: validBody };
    const res = mockResponse();
    const next = jest.fn();

    saveMaterial(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('returns 400 when a required field is missing', () => {
    const { sku, ...bodyWithoutSku } = validBody;
    const req = { body: bodyWithoutSku };
    const res = mockResponse();
    const next = jest.fn();

    saveMaterial(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when unitOfMeasure is not allowed', () => {
    const req = { body: { ...validBody, unitOfMeasure: 'banana' } };
    const res = mockResponse();
    const next = jest.fn();

    saveMaterial(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
