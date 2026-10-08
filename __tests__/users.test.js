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

describe('Users API', () => {
    test('GET /users returns 200', async () => {
        const response = await request(app).get('/users');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /users/:id returns 200', async () => {
        const response = await request(app).get(
            '/users/6ac03724c56dfb7ead10a361'
        );

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe('6ac03724c56dfb7ead10a361');
    });
});