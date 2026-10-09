const { saveUser } = require('../middleware/validateUser');
const { saveProductionOrder } = require('../middleware/validateProductionOrder');
const customerOrderValidation = require('../middleware/validateCustomerOrder');

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

describe('saveUser validation', () => {
  test('calls next() when the body is valid', () => {
    const { next } = runValidation(saveUser, { username: 'daniel257p', email: 'daniel@example.com', role: 'admin' });

    expect(next).toHaveBeenCalled();
  });

  test('returns 400 when the email is invalid', () => {
    const { res, next } = runValidation(saveUser, { email: 'not-an-email' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when the role is not allowed', () => {
    const { res, next } = runValidation(saveUser, { role: 'superuser' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('saveProductionOrder validation', () => {
  const validOrder = {
    orderNumber: 'PO-1001',
    productId: '507f1f77bcf86cd799439011',
    quantityPlanned: 100,
    startDate: '2026-10-05'
  };

  test('calls next() when the body is valid', () => {
    const { next } = runValidation(saveProductionOrder, validOrder);

    expect(next).toHaveBeenCalled();
  });

  test('returns 400 when a required field is missing', () => {
    const { startDate, ...orderWithoutStartDate } = validOrder;
    const { res, next } = runValidation(saveProductionOrder, orderWithoutStartDate);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when productId is not a valid ObjectId', () => {
    const { res, next } = runValidation(saveProductionOrder, { ...validOrder, productId: '123' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when quantityPlanned is less than 1', () => {
    const { res, next } = runValidation(saveProductionOrder, { ...validOrder, quantityPlanned: 0 });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when status is not allowed', () => {
    const { res, next } = runValidation(saveProductionOrder, { ...validOrder, status: 'paused' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('createCustomerOrder validation', () => {
  const validOrder = {
    orderNumber: 'CO-2026-001',
    customerName: 'Acme Retail',
    customerEmail: 'orders@acmeretail.com',
    productId: '66f5a1b2c3d4e5f6a7b8c901',
    quantity: 20
  };

  test('calls next() when the body is valid', () => {
    const { next } = runValidation(customerOrderValidation.createCustomerOrder, validOrder);

    expect(next).toHaveBeenCalled();
  });

  test('returns 400 when the customer email is invalid', () => {
    const { res, next } = runValidation(customerOrderValidation.createCustomerOrder, {
      ...validOrder,
      customerEmail: 'acme'
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when quantity is not a positive integer', () => {
    const { res, next } = runValidation(customerOrderValidation.createCustomerOrder, { ...validOrder, quantity: 0 });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 400 when the body is empty', () => {
    const { res, next } = runValidation(customerOrderValidation.createCustomerOrder, undefined);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('updateCustomerOrder validation', () => {
  test('calls next() when only customer fields are sent', () => {
    const { next } = runValidation(customerOrderValidation.updateCustomerOrder, {
      customerName: 'Acme Retail',
      dueDate: '2026-10-20'
    });

    expect(next).toHaveBeenCalled();
  });

  test('returns 400 when the customer email is invalid', () => {
    const { res, next } = runValidation(customerOrderValidation.updateCustomerOrder, { customerEmail: 'acme' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
