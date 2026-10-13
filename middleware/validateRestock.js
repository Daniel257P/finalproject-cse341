const validator = require('../utils/validate');

const restock = (req, res, next) => {
  const validationRule = {
    quantity: 'required|integer|min:1'
  };

  validator(req.body || {}, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: err
      });
    }
    next();
  });
};

module.exports = {
  restock
};
