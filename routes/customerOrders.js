const express = require('express');
const router = express.Router();

const customerOrderController = require('../controllers/customerOrders');
const validation = require('../middleware/validateCustomerOrder');
const validateId = require('../middleware/validateId');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', customerOrderController.getAll);
router.get('/:id', validateId, customerOrderController.getSingle);
router.post('/', isAuthenticated, validation.createCustomerOrder, customerOrderController.createCustomerOrder);
router.put('/:id', isAuthenticated, validateId, validation.updateCustomerOrder, customerOrderController.updateCustomerOrder);
router.put('/:id/ship', isAuthenticated, validateId, customerOrderController.shipCustomerOrder);
router.delete('/:id', isAuthenticated, validateId, customerOrderController.deleteCustomerOrder);

module.exports = router;