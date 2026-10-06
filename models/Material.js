const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true},
    unitOfMeasure: {
      type: String,
      enum: ['pcs', 'kg', 'g', 'lb', 'l', 'liters', 'ml', 'm', 'cm', 'ft', 'bags'],
      required: true
    },
    quantityOnHand:{type:Number, default:0, min: 0},
    reorderPoint: { type: Number,default:0, min: 0 },
    unitCost: { type: Number, required:true, min: 0},
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null},
    location: { type: String},
    lastReceivedDate:{type: Date, default: Date.now}
},
  { versionKey: false }
 
);

module.exports = mongoose.model('Material', materialSchema, 'materials');
