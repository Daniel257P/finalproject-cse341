const mongoose = require('mongoose');

const productionOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantityPlanned: { type: Number, required: true, min: 1 },
    quantityProduced: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    startDate: { type: Date, required: true },
    completedDate: { type: Date, default: null },
    notes: { type: String },
    customerOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerOrder', default: null }
  },
  { versionKey: false }
);

module.exports = mongoose.model('ProductionOrder', productionOrderSchema, 'productionOrders');
