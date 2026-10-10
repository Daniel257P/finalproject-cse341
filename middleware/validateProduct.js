
const validator = require('../utils/validate');

const saveProduct = (req, res, next) => {
    const validationRule = {
        sku: 'required|string',
        name: 'required|string',
        description: 'required|string',
        unitOfMeasure: 'required|string|in:pcs,kg,g,lb,l,ml,m,cm,ft',
        quantityOnHand: 'numeric|min:0',
        reorderPoint: 'numeric|min:0',
        unitPrice: 'required|numeric|min:0',
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