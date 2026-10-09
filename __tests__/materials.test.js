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

describe('Materials API', () => {
    test('GET /materials returns 200', async () => {
        const response = await request(app).get('/materials');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});

test('GET /materials/:id returns 200', async () => {
    const response = await request(app).get('/materials/6abbdf6f5e6053fb1ee06ab0');

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe('6abbdf6f5e6053fb1ee06ab0');
});