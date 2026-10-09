
const Supplier = require('../models/Supplier');

const buildSupplier = (body) => {
    const supplier = {
        supplierCode: body.supplierCode,
        name: body.name,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        isActive: body.isActive
    };

    Object.keys(supplier).forEach(
        (key) => supplier[key] === undefined && delete supplier[key]
    );

    return supplier;
};

const getAll = async (req, res) => {
    //#swagger.tags=['Suppliers']
    try {
        const suppliers = await Supplier.find();
        res.status(200).json(suppliers);
    } catch (err) {
        res.status(500).json({
            message: 'Error retrieving suppliers.',
            error: err.message
        });
    }
};

const getSingle = async (req, res) => {
    //#swagger.tags=['Suppliers']
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        res.status(200).json(supplier);
    } catch (err) {
        res.status(500).json({
            message: 'Error retrieving supplier.',
            error: err.message
        });
    }
};

const createSupplier = async (req, res) => {
    //#swagger.tags=['Suppliers']
    /* #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: {
           supplierCode: 'SUP-001',
           name: 'Acme Lumber',
           contactName: 'Ann Smith',
           email: 'ann@acmelumber.com',
           phone: '555-0100',
           address: '100 Main St, Springfield',
           isActive: true
         }
    } */
    try {
        const supplier = await Supplier.create(buildSupplier(req.body));

        res.status(201).json({
            message: 'Supplier created successfully.',
            data: supplier
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'A supplier with that code already exists.'
            });
        }

        res.status(500).json({
            message: 'Error creating supplier.',
            error: err.message
        });
    }
};

const updateSupplier = async (req, res) => {
    //#swagger.tags=['Suppliers']
    /* #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: {
           supplierCode: 'SUP-001',
           name: 'Acme Lumber',
           contactName: 'Ann Smith',
           email: 'ann@acmelumber.com',
           phone: '555-0100',
           address: '100 Main St, Springfield',
           isActive: true
         }
    } */
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            buildSupplier(req.body),
            { new: true, runValidators: true }
        );

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        res.status(200).json({
            message: 'Supplier updated successfully.',
            data: supplier
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'A supplier with that code already exists.'
            });
        }

        res.status(500).json({
            message: 'Error updating supplier.',
            error: err.message
        });
    }
};

const deleteSupplier = async (req, res) => {
    //#swagger.tags=['Suppliers']
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        return res.status(204).end();
    } catch (err) {
        res.status(500).json({
            message: 'Error deleting supplier.',
            error: err.message
        });
    }
};

module.exports = {
    getAll,
    getSingle,
    createSupplier,
    updateSupplier,
    deleteSupplier
};