
const ProductionOrder = require('../models/ProductionOrder');

const buildOrder = (body) => {

  const order = {

    orderNumber: body.orderNumber,

    productId: body.productId,

    quantityPlanned: body.quantityPlanned,

    quantityProduced: body.quantityProduced,

    status: body.status,

    startDate: body.startDate,

    completedDate: body.completedDate,

    notes: body.notes

  };

  Object.keys(order).forEach((key) => order[key] === undefined && delete order[key]);

  return order;

};

const getAll = async (req, res) => {

  //#swagger.tags=['Production Orders']

  try {

    const orders = await ProductionOrder.find();

    res.status(200).json(orders);

  } catch (err) {

    res.status(500).json({ message: 'Some error occurred while retrieving production orders.', error: err.message });

  }

};

const getSingle = async (req, res) => {

  //#swagger.tags=['Production Orders']

  try {

    const order = await ProductionOrder.findById(req.params.id);

    if (!order) {

      return res.status(404).json({ message: 'Production order not found.' });

    }

    res.status(200).json(order);

  } catch (err) {

    res.status(500).json({ message: 'Some error occurred while retrieving the production order.', error: err.message });

  }

};

const createProductionOrder = async (req, res) => {

  //#swagger.tags=['Production Orders']

  /* #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         orderNumber: 'PO-1001',
         productId: '507f1f77bcf86cd799439011',
         quantityPlanned: 100,
         quantityProduced: 0,
         status: 'planned',
         startDate: '2026-10-05',
         completedDate: '2026-10-10',
         notes: 'Initial production run'
       }
  } */

  try {

    const response = await ProductionOrder.create(buildOrder(req.body));

    res.status(201).json({ message: 'Production order created successfully', data: response });

  } catch (err) {

    if (err.code === 11000) {

      return res.status(409).json({ message: 'A production order with that orderNumber already exists.' });

    }

    res.status(500).json({ message: 'Some error occurred while creating the production order.', error: err.message });

  }

};

const updateProductionOrder = async (req, res) => {

  //#swagger.tags=['Production Orders']

  /* #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         orderNumber: 'PO-1001',
         productId: '507f1f77bcf86cd799439011',
         quantityPlanned: 150,
         quantityProduced: 50,
         status: 'in-progress',
         startDate: '2026-10-05',
         completedDate: '2026-10-10',
         notes: 'Production updated'
       }
  } */

  try {

    const response = await ProductionOrder.findByIdAndUpdate(req.params.id, buildOrder(req.body), {

      runValidators: true

    });

    if (!response) {

      return res.status(404).json({ message: 'Production order not found.' });

    }

    res.status(200).json({ message: 'Production order updated successfully' });

  } catch (err) {

    if (err.code === 11000) {

      return res.status(409).json({ message: 'A production order with that orderNumber already exists.' });

    }

    res.status(500).json({ message: 'Some error occurred while updating the production order.', error: err.message });

  }

};

const deleteProductionOrder = async (req, res) => {

  //#swagger.tags=['Production Orders']

  try {

    const response = await ProductionOrder.findByIdAndDelete(req.params.id);

    if (!response) {

      return res.status(404).json({ message: 'Production order not found.' });

    }

    res.sendStatus(204);

  } catch (err) {

    res.status(500).json({ message: 'Some error occurred while deleting the production order.', error: err.message });

  }

};

module.exports = {

  getAll,

  getSingle,

  createProductionOrder,

  updateProductionOrder,

  deleteProductionOrder

};

