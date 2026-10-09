
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
    productsController.createProduct
);

router.put(
    '/:id',
    isAuthenticated,
    validateId,
    validation.saveProduct,
    productsController.updateProduct
);

router.delete(
    '/:id',
    isAuthenticated,
    validateId,
    productsController.deleteProduct
);

module.exports = router;