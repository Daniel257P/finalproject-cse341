
const validator = require('../utils/validate');

const saveProduct = (req, res, next) => {
    const validationRule = {
        sku: 'string | required',
        name: 'string | required',
        description: 'string | required',
        unitOfMeasure: 'required|string|in:pcs,kg,g,lb,l,liters,ml,m,cm,ft,bags',
        quantityOnHand: 'numeric|min:0',
        reorderPoint: 'numeric|min:0',
        unitPrice: 'double | required',
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