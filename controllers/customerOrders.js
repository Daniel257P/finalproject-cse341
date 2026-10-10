const mongoose = require('mongoose');
const CustomerOrder = require('../models/CustomerOrder');
const ProductionOrder = require('../models/ProductionOrder');

// field used: quantityOnHand (stock of finished goods).
const products = () => mongoose.connection.collection('products');

//  Descount the stock SOLO if there is enough (never goes negative).
// Returns true if the stock was successfully reserved.
const reserveStock = async (productId, quantity) => {
  const result = await products().updateOne(
    { _id: new mongoose.Types.ObjectId(productId), quantityOnHand: { $gte: quantity } },
    { $inc: { quantityOnHand: -quantity } }
  );
  return result.modifiedCount === 1;
};

const returnStock = (productId, quantity) =>
  products().updateOne(
    { _id: new mongoose.Types.ObjectId(productId) },
    { $inc: { quantityOnHand: quantity } }
  );

const getAll = async (req, res) => {
  //#swagger.tags=['Customer Orders']
  try {
    const orders = await CustomerOrder.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving customer orders.', error: err.message });
  }
};

const getSingle = async (req, res) => {
  //#swagger.tags=['Customer Orders']
  try {
    const order = await CustomerOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Customer order not found.' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving the customer order.', error: err.message });
  }
};

const createCustomerOrder = async (req, res) => {
  //#swagger.tags=['Customer Orders']
  //#swagger.description='Creates a customer order. If there is enough finished-goods stock it is reserved (status "ready"); otherwise a production order is created automatically (status "in-production").'
  /* #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         orderNumber: 'CO-2026-001',
         customerName: 'Acme Retail',
         customerEmail: 'orders@acmeretail.com',
         productId: '66f5a1b2c3d4e5f6a7b8c901',
         quantity: 20,
         dueDate: '2026-10-15',
         notes: 'These parts are rework sample pieces'
       }
  } */
  const { orderNumber, customerName, customerEmail, productId, quantity, orderDate, dueDate, notes } = req.body;
  let order;

  try {
    // 1. Product must exist
    const product = await products().findOne({ _id: new mongoose.Types.ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // 2.  Create the customer order (status "pending")
    order = await CustomerOrder.create({
      orderNumber,
      customerName,
      customerEmail,
      productId,
      quantity,
      orderDate,
      dueDate,
      notes
    });

    // 3.Do we have enough stock to fulfill the order? If yes, reserve it and mark the order as "ready".
    if (await reserveStock(productId, quantity)) {
      order.status = 'ready';
      await order.save();
      return res.status(201).json({
        message: 'Customer order created. Stock was available and has been reserved.',
        data: order
      });
    }

    // 4.No stock available, create a production order and mark the customer order as "in-production".
    const productionOrder = await ProductionOrder.create({
      orderNumber: `PO-${orderNumber}`,
      productId,
      quantityPlanned: quantity,
      startDate: new Date(),
      customerOrderId: order._id,
      notes: `Created automatically for customer order ${orderNumber}`
    });

    order.status = 'in-production';
    order.productionOrderId = productionOrder._id;
    await order.save();

    res.status(201).json({
      message: 'Customer order created. Not enough stock, so a production order was created.',
      data: order,
      productionOrder
    });
  } catch (err) {
    if (err.code === 11000) {
      // Si el duplicado fue de la orden de producción, deshacer la orden del cliente
      if (order) await CustomerOrder.findByIdAndDelete(order._id);
      return res.status(409).json({ message: 'An order with that orderNumber already exists.' });
    }
    if (order && order.status === 'pending') await CustomerOrder.findByIdAndDelete(order._id);
    res.status(500).json({ message: 'Some error occurred while creating the customer order.', error: err.message });
  }
};

const updateCustomerOrder = async (req, res) => {
  //#swagger.tags=['Customer Orders']
  //#swagger.description='Updates customer information only. Product and quantity cannot be changed after inventory has moved.'
  /* #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         customerName: 'Acme Retail',
         customerEmail: 'orders@acmeretail.com',
         dueDate: '2026-10-20',
         notes: 'New delivery date'
       }
  } */
  try {
    const update = {
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      dueDate: req.body.dueDate,
      notes: req.body.notes
    };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const response = await CustomerOrder.findByIdAndUpdate(req.params.id, update, { runValidators: true });
    if (!response) {
      return res.status(404).json({ message: 'Customer order not found.' });
    }
    res.status(200).json({ message: 'Customer order updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while updating the customer order.', error: err.message });
  }
};

const shipCustomerOrder = async (req, res) => {
  //#swagger.tags=['Customer Orders']
  //#swagger.description='Marks a "ready" customer order as shipped.'
  try {
    const order = await CustomerOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Customer order not found.' });
    }
    if (order.status !== 'ready') {
      return res.status(409).json({ message: `Only orders with status "ready" can be shipped. Current status: "${order.status}".` });
    }
    order.status = 'shipped';
    await order.save();
    res.status(200).json({ message: 'Customer order shipped successfully', data: order });
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while shipping the customer order.', error: err.message });
  }
};

const deleteCustomerOrder = async (req, res) => {
  //#swagger.tags=['Customer Orders']
  //#swagger.description='Deletes a customer order. Reserved stock is returned and a linked production order is cancelled.'
  try {
    const order = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Customer order not found.' });
    }

    // Return reserved stock if the order was "ready"
    if (order.status === 'ready') {
      await returnStock(order.productId, order.quantity);
    }

    // Cancel linked production order if the customer order was "in-production"
    if (order.status === 'in-production' && order.productionOrderId) {
      await ProductionOrder.updateOne(
        { _id: order.productionOrderId, status: { $in: ['planned', 'in-progress'] } },
        { status: 'cancelled' }
      );
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while deleting the customer order.', error: err.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createCustomerOrder,
  updateCustomerOrder,
  shipCustomerOrder,
  deleteCustomerOrder
};