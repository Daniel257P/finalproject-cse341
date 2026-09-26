const validator = require('../utils/validate');

const saveUser = (req, res, next) => {
  const validationRule = {
    username: 'string',
    displayName: 'string',
    email: 'email',
    role: 'in:admin,warehouse,production'
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
  saveUser
};