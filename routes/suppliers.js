
const express = require('express');
const router = express.Router();

const suppliersController = require('../controllers/suppliers');
const validation = require('../middleware/validateSupplier');
const validateId = require('../middleware/validateId');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', suppliersController.getAll);
router.get('/:id', validateId, suppliersController.getSingle);

router.post(
    '/',
    isAuthenticated,
    validation.saveSupplier,
    suppliersController.createSupplier
);

router.put(
    '/:id',
    isAuthenticated,
    validateId,
    validation.saveSupplier,
    suppliersController.updateSupplier
);

router.delete(
    '/:id',
    isAuthenticated,
    validateId,
    suppliersController.deleteSupplier
);

module.exports = router;