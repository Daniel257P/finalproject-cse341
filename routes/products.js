
const express = require('express');
const router = express.Router();

const productsController = require('../controllers/products');
const validation = require('../middleware/validateProduct');
const validateId = require('../middleware/validateId');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', productsController.getAll);
router.get('/:id', validateId, productsController.getSingle);




router.post(
    '/',
    isAuthenticated,
    validation.saveProduct,
    (req, res, next) => {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Product details',
            schema: {
                sku: 'PROD-001',
                name: 'Steel Sheet',
                description: 'Sheet metal for manufacturing',
                unitOfMeasure: 'pcs',
                quantityOnHand: 100,
                reorderPoint: 10,
                unitPrice: 2500,
                location: 'Warehouse A'
            }
        } */
        productsController.createProduct(req, res, next);
    }
);


router.put(
    '/:id',
    isAuthenticated,
    validateId,
    validation.saveProduct,
    (req, res, next) => {
        /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            description: 'Updated product details',
            schema: {
                sku: 'PROD-001',
                name: 'Steel Sheet',
                description: 'Sheet metal for manufacturing',
                unitOfMeasure: 'pcs',
                quantityOnHand: 100,
                reorderPoint: 10,
                unitPrice: 2500,
                location: 'Warehouse A'
            }
        } */
        productsController.updateProduct(req, res, next);
    }
);


router.delete(
    '/:id',
    isAuthenticated,
    validateId,
    /* #swagger.tags = ['Products'] */
    productsController.deleteProduct
);

module.exports = router;