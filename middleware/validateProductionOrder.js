const validator = require('../utils/validate');

const saveProductionOrder = (req, res, next) => {
  const validationRule = {
    orderNumber: 'required|string',
    productId: ['required', 'regex:/^[0-9a-fA-F]{24}$/'],
    quantityPlanned: 'required|integer|min:1',
    quantityProduced: 'integer|min:0',
    status: 'in:planned,in-progress,completed,cancelled',
    startDate: 'required|date',
    completedDate: 'date',
    notes: 'string'
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

module.exports = {
  saveProductionOrder
};
