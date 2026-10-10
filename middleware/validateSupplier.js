
const validator = require('../utils/validate');

const saveSupplier = (req, res, next) => {
    const validationRule = {
        supplierCode: 'string|required',
        name: 'string|required',
        contactName: 'string|required',
        email: 'string|required',
        phone: 'string|required',
        address: 'string|required',
        isActive: 'boolean'
    };

    validator(req.body, validationRule, {}, (err, status) => {
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
    saveSupplier
};