const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const database = require('../data/database');

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
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Production Orders API', () => {
    test('GET /production-orders returns 200', async () => {
        const response = await request(app).get('/production-orders');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /production-orders/:id returns 200', async () => {
        const response = await request(app).get(
            '/production-orders/6ac69d0866f374b902e1b8c7'
        );

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe('6ac69d0866f374b902e1b8c7');
    });
});