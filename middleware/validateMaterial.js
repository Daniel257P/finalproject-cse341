const validator = require('../utils/validate');

const saveMaterial = (req, res, next) => {
  const validationRule = {
        sku: 'string | required',
        name: 'string | required',
        description: 'string',
        unitOfMeasure: 'string',
        quantityOnHand:'number',
        reorderPoint: 'number',
        unitCost: 'double',
        supplierId: 'ObjectId',
        location: 'string',
        lastReceivedDate:'date'
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
