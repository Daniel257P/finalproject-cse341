const Material= require('../models/Material');

const buildMaterial = (body) => {
  const order = {
    sku: body.sku,
    name: body.name,
    description: body.description,
    unitOfMeasure: body.unitOfMeasure,
    quantityOnHand: body.quantityOnHand,
    reorderPoint: body.reorderPoint,
    unitCost: body.unitCost,
    supplierId: body.supplierId,
    location: body.location,
    lastReceivedDate: body.lastReceivedDate


  };
  Object.keys(material).forEach((key) => material[key] === undefined && delete material[key]);
  return material;
};

const getAll = async (req, res) => {
  //#swagger.tags=['Materials']
  try {
    const materials = await Material.find();
    res.status(200).json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving materials.', error: err.message });
  }
};

const getSingle = async (req, res) => {
  //#swagger.tags=['Material']
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }
    res.status(200).json(material);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving the Material.', error: err.message });
  }
};

const getLowStock = async (req, res) => {
  //#swagger.tags=['Low Stock Materials']
  //#swagger.description='Returns materials whose quantityOnHand is at or below their reorderLevel.'
  try {
    const materials = await Material.find({ $expr: { $lte: ['$quantityOnHand', '$reorderLevel'] } });
    res.status(200).json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving low-stock materials.', error: err.message });
  }
};

const createMaterial = async (req, res) => {
    //#swagger.tags=['Materials']
    /* #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
            sku: 'PAINT-WHT-20L',
            name: 'White Emulsion Paint',
            description: '20 liter bucket of weather-resistant white emulsion paint',
            unitOfMeasure:  'liters',
            quantityOnHand: '40',
            reorderPoint: '10',
            unitCost: '35.99',
            supplierId: 'SUP-002',
            location: 'Warehouse-B-04',
            lastReceivedDate: '2026-09-25T00:00:00Z'
       }
    } */
  try {
    const response = await Material.create(buildMaterial(req.body));
    res.status(201).json({ message: 'Material created successfully', data: response });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A Material with that Id already exists.' });
    }
    res.status(500).json({ message: 'Some error occurred while creating the Material.', error: err.message });
  }
};

const updateMaterial = async (req, res) => {
  //#swagger.tags=['Material']
  try {
    const response = await Material.findByIdAndUpdate(req.params.id, buildMaterial(req.body), {
      runValidators: true
    });
    if (!response) {
      return res.status(404).json({ message: 'Material is not found.' });
    }
    res.status(200).json({ message: 'Material updated successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A Material with that Id already exists.' });
    }
    res.status(500).json({ message: 'Some error occurred while updating the Material.', error: err.message });
  }
};

const deleteMaterial = async (req, res) => {
  //#swagger.tags=['Material']
  try {
    const response = await Material.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'Material not found.' });
    }
    res.status(204).json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while deleting the Material.', error: err.message });
  }
};

module.exports = {
  getAll,
  getSingle, 
  getLowStock,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
