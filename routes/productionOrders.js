const express = require('express');

const router = express.Router();

const productionOrderController = require('../controllers/productionOrders');

const validation = require('../middleware/validateProductionOrder');

const validateId = require('../middleware/validateId');

const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', productionOrderController.getAll);

router.get('/:id', validateId, productionOrderController.getSingle);

// #swagger.parameters['body'] = {
//   in: 'body',
//   required: true,
//   schema: {
//     type: 'object',
//     required: ['orderNumber', 'productId', 'quantityPlanned', 'startDate'],
//     properties: {
//       orderNumber: { type: 'string', example: 'PO-1001' },
//       productId: {
//         type: 'string',
//         pattern: '^[0-9a-fA-F]{24}$',
//         example: '507f1f77bcf86cd799439011'
//       },
//       quantityPlanned: { type: 'integer', minimum: 1, example: 100 },
//       quantityProduced: { type: 'integer', minimum: 0, example: 0 },
//       status: {
//         type: 'string',
//         enum: ['planned', 'in-progress', 'completed', 'cancelled'],
//         example: 'planned'
//       },
//       startDate: { type: 'string', format: 'date', example: '2026-10-05' },
//       completedDate: { type: 'string', format: 'date', example: '2026-10-10' },
//       notes: { type: 'string', example: 'Initial production run' }
//     }
//   }
// }
router.post('/', isAuthenticated, validation.saveProductionOrder, productionOrderController.createProductionOrder);

// #swagger.parameters['body'] = {
//   in: 'body',
//   required: true,
//   schema: {
//     type: 'object',
//     properties: {
//       orderNumber: { type: 'string', example: 'PO-1001' },
//       productId: {
//         type: 'string',
//         pattern: '^[0-9a-fA-F]{24}$',
//         example: '507f1f77bcf86cd799439011'
//       },
//       quantityPlanned: { type: 'integer', minimum: 1, example: 150 },
//       quantityProduced: { type: 'integer', minimum: 0, example: 50 },
//       status: {
//         type: 'string',
//         enum: ['planned', 'in-progress', 'completed', 'cancelled'],
//         example: 'in-progress'
//       },
//       startDate: { type: 'string', format: 'date', example: '2026-10-05' },
//       completedDate: { type: 'string', format: 'date', example: '2026-10-10' },
//       notes: { type: 'string', example: 'Production updated' }
//     }
//   }
// }
router.put('/:id', isAuthenticated, validateId, validation.saveProductionOrder, productionOrderController.updateProductionOrder);

router.delete('/:id', isAuthenticated, validateId, productionOrderController.deleteProductionOrder);

module.exports = router;