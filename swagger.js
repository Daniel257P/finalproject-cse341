const swaggerAutogen = require('swagger-autogen')();

const host =
  process.env.RENDER_EXTERNAL_HOSTNAME ||
  'finalproject-cse341-q4uy.onrender.com';

const schemes = ['https'];

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