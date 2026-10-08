const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const database = require('../data/database');
const CustomerOrder = require('../models/CustomerOrder');

const productId = '6ac663d381c576f44fe9b2d5';

let customerOrderId;

beforeAll(async () => {
    await new Promise((resolve, reject) => {
        database.initDb((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    const testOrder = await CustomerOrder.create({
        orderNumber: `TEST-CO-${Date.now()}`,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        productId,
        quantity: 1,
        notes: 'Test order for GET endpoint'
    });

    customerOrderId = testOrder._id.toString();
});

afterAll(async () => {
    if (customerOrderId) {
        await CustomerOrder.findByIdAndDelete(customerOrderId);
    }

    await mongoose.connection.close();
});

describe('Customer Orders API', () => {
    test('GET /customer-orders returns 200', async () => {
        const response = await request(app).get('/customer-orders');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /customer-orders/:id returns 200', async () => {
        const response = await request(app).get(`/customer-orders/${customerOrderId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(customerOrderId);
    });
});