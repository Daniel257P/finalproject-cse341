
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        sku: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        unitOfMeasure: {
            type: String,
            enum: ['pcs', 'kg', 'g', 'lb', 'l', 'ml', 'm', 'cm', 'ft'],
            required: true
        },
        quantityOnHand: { type: Number, default: 0, min: 0 },
        reorderPoint: { type: Number, default: 0, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        location: { type: String },
        isActive: { type: Boolean, default: true }
    },
    { versionKey: false }
);

module.exports = mongoose.model('Product', productSchema, 'products');