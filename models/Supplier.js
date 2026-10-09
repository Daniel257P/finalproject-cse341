
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
    {
        supplierCode: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        contactName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    },
    { versionKey: false }
);

module.exports = mongoose.model('Supplier', supplierSchema, 'suppliers');