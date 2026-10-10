
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
    (req, res, next) => {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Supplier details',
            schema: {
                supplierCode: 'SUP-001',
                name: 'ABC Industrial Supplies',
                contactName: 'John Doe',
                email: 'john@example.com',
                phone: '+2348012345678',
                address: 'Lagos, Nigeria',
                isActive: true
            }
        } */
        suppliersController.createSupplier(req, res, next);
    }
);



router.put(
    '/:id',
    isAuthenticated,
    validateId,
    validation.saveSupplier,
    (req, res, next) => {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Updated supplier details',
            schema: {
                supplierCode: 'SUP-001',
                name: 'ABC Industrial Supplies',
                contactName: 'John Doe',
                email: 'john@example.com',
                phone: '+2348012345678',
                address: 'Lagos, Nigeria',
                isActive: true
            }
        } */
        suppliersController.updateSupplier(req, res, next);
    }
);

router.delete(
    '/:id',
    isAuthenticated,
    validateId,
    suppliersController.deleteSupplier
);

module.exports = router;