const validator = require('../utils/validate');

const saveMaterial = (req, res, next) => {
  const validationRule = {
    sku: 'required|string',
    name: 'required|string',
    description: 'required|string',
    unitOfMeasure: 'required|string|in:pcs,kg,g,lb,l,liters,ml,m,cm,ft,bags',
    quantityOnHand: 'numeric|min:0',
    reorderPoint: 'numeric|min:0',
    unitCost: 'required|numeric|min:0',
    supplierId: 'regex:/^[0-9a-fA-F]{24}$/', // Validates 24-char MongoDB ObjectId hex string
    location: 'string',
    lastReceivedDate: 'date'
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
  saveMaterial
};
