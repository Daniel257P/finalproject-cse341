const express = require('express');
const router = express.Router();

const materialsController = require('../controllers/materials');
const validation = require('../middleware/validateMaterial');
const validateId = require('../middleware/validateId');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', materialsController.getAll);
router.get('/low-stock', materialsController.getLowStock);
router.get('/:id', validateId, materialsController.getSingle);
router.post('/', isAuthenticated, validation.saveMaterial, materialsController.createMaterial);
router.put('/:id', isAuthenticated, validateId, validation.saveMaterial, materialsController.updateMaterial);
router.delete('/:id', isAuthenticated, validateId, materialsController.deleteMaterial);

module.exports = router;
