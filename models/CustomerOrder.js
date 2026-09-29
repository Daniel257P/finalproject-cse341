const mongoose = require('mongoose');

const customerOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'in-production', 'ready', 'shipped', 'cancelled'],
      default: 'pending'
    },
    orderDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    productionOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionOrder', default: null },
    notes: { type: String }
  },
  { versionKey: false }
);

module.exports = mongoose.model('CustomerOrder', customerOrderSchema, 'customerOrders');