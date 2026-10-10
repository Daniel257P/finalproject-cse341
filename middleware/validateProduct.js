
const validator = require('../utils/validate');

const saveProduct = (req, res, next) => {
    const validationRule = {
        sku: 'string|required',
        name: 'string|required',
        description: 'string|required',
        unitOfMeasure: 'string|required',
        quantityOnHand: 'integer',
        reorderPoint: 'integer',
        unitPrice: 'numeric|required',
        location: 'string',
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
    saveProduct
};