const validator = require('../utils/validate');

const sendErrors = (res, err) =>
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    data: err
  });

// POST: All required fields for creating a customer order.
// "status" and "productionOrderId" are not accepted: the API decides them.
const createCustomerOrder = (req, res, next) => {
  const validationRule = {
    orderNumber: 'required|string',
    customerName: 'required|string',
    customerEmail: 'required|email',
    productId: ['required', 'regex:/^[0-9a-fA-F]{24}$/'],
    quantity: 'required|integer|min:1',
    orderDate: 'date',
    dueDate: 'date',
    notes: 'string'
  };

  validator(req.body || {}, validationRule, {}, (err, status) => {
    if (!status) return sendErrors(res, err);
    next();
  });
};

// PUT: Just customer information. The product and quantity are not changed
// because the inventory has already been moved when creating the order.
const updateCustomerOrder = (req, res, next) => {
  const validationRule = {
    customerName: 'string',
    customerEmail: 'email',
    dueDate: 'date',
    notes: 'string'
  };

  validator(req.body || {}, validationRule, {}, (err, status) => {
    if (!status) return sendErrors(res, err);
    next();
  });
};

module.exports = {
  createCustomerOrder,
  updateCustomerOrder
};