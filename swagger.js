const swaggerAutogen = require('swagger-autogen')();

const host = process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost:3000';
const schemes = process.env.RENDER_EXTERNAL_HOSTNAME ? ['https'] : ['http'];

const doc = {
  info: {
    title: 'StockFlow API',
    description: 'Inventory API for a small manufacturing plant'
  },
  host,
  schemes
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);