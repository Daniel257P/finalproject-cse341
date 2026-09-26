const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');
const validation = require('../middleware/validateUser');
const validateId = require('../middleware/validateId');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/me', isAuthenticated, userController.getMe);
router.get('/', isAuthenticated, userController.getAll);
router.get('/:id', isAuthenticated, validateId, userController.getSingle);
router.put('/:id', isAuthenticated, validateId, validation.saveUser, userController.updateUser);
router.delete('/:id', isAuthenticated, validateId, userController.deleteUser);

module.exports = router;
