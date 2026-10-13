
const Product = require('../models/Product');

const buildProduct = (body) => {
    const product = {
        sku: body.sku,
        name: body.name,
        description: body.description,
        unitOfMeasure: body.unitOfMeasure,
        quantityOnHand: body.quantityOnHand,
        reorderPoint: body.reorderPoint,
        unitPrice: body.unitPrice,
        location: body.location,
        isActive: body.isActive
    };

    Object.keys(product).forEach(
        (key) => product[key] === undefined && delete product[key]
    );

    return product;
};

const getAll = async (req, res) => {
    //#swagger.tags=['Products']
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({
            message: 'Error retrieving products.',
            error: err.message
        });
    }
};

const getSingle = async (req, res) => {
    //#swagger.tags=['Products']
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({
            message: 'Error retrieving product.',
            error: err.message
        });
    }
};

const createProduct = async (req, res) => {
    //#swagger.tags=['Products']
    /* #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: {
           sku: 'CHAIR-OAK-001',
           name: 'Oak Chair',
           description: 'Solid oak dining chair',
           unitOfMeasure: 'pcs',
           quantityOnHand: 25,
           reorderPoint: 5,
           unitPrice: 89.99,
           location: 'Warehouse-C-02',
           isActive: true
         }
    } */
    try {
        const product = await Product.create(buildProduct(req.body));

        res.status(201).json({
            message: 'Product created successfully.',
            data: product
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'A product with that SKU already exists.'
            });
        }

        res.status(500).json({
            message: 'Error creating product.',
            error: err.message
        });
    }
};
const getLowStock = async (req, res) => {
    //#swagger.tags=['Low Stock']
    //#swagger.description='Returns products whose quantityOnHand is at or below their reorderPoint. These are the products that may not cover new customer orders.'
    try {
        const products = await Product.find({
            $expr: { $lte: ['$quantityOnHand', '$reorderPoint'] }
        });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({
            message: 'Error retrieving low-stock products.',
            error: err.message
        });
    }
};

const restockProduct = async (req, res) => {
    //#swagger.tags=['Low Stock']
    //#swagger.description='Adds finished units to a product (quantityOnHand += quantity) so new customer orders can be served from stock.'
    /* #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: { quantity: 50 }
    } */
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { quantityOnHand: Number(req.body.quantity) } },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({
            message: 'Product restocked successfully.',
            data: product
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error restocking product.',
            error: err.message
        });
    }
};


const updateProduct = async (req, res) => {
    //#swagger.tags=['Products']
    /* #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: {
           sku: 'CHAIR-OAK-001',
           name: 'Oak Chair',
           description: 'Solid oak dining chair',
           unitOfMeasure: 'pcs',
           quantityOnHand: 25,
           reorderPoint: 5,
           unitPrice: 89.99,
           location: 'Warehouse-C-02',
           isActive: true
         }
    } */
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            buildProduct(req.body),
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({
            message: 'Product updated successfully.',
            data: product
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'A product with that SKU already exists.'
            });
        }

        res.status(500).json({
            message: 'Error updating product.',
            error: err.message
        });
    }
};

const deleteProduct = async (req, res) => {
 try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        return res.status(204).end();
    } catch (err) {
        res.status(500).json({
            message: 'Error deleting product.',
            error: err.message
        });
    }
};

module.exports = {
    getAll,
    getSingle,
    getLowStock,
    createProduct,
    updateProduct,
    deleteProduct,
    restockProduct
};