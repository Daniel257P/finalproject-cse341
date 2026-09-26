const express = require('express');
const router = express.Router();

const productionOrderController = require('../controllers/productionOrders');
const validation = require('../middleware/validateProductionOrder');
const validateId = require('../middleware/validateId');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', productionOrderController.getAll);
router.get('/:id', validateId, productionOrderController.getSingle);
router.post('/', isAuthenticated, validation.saveProductionOrder, productionOrderController.createProductionOrder);
router.put('/:id', isAuthenticated, validateId, validation.saveProductionOrder, productionOrderController.updateProductionOrder);
router.delete('/:id', isAuthenticated, validateId, productionOrderController.deleteProductionOrder);

module.exports = router;
