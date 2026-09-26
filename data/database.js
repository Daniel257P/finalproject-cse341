const dotenv = require('dotenv');
dotenv.config();

require('dns').setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const initDb = (callback) => {
  if (mongoose.connection.readyState === 1) {
    console.log('Db is already initialized!');
    return callback(null, mongoose.connection);
  }
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => callback(null, mongoose.connection))
    .catch((err) => callback(err));
};

module.exports = {
  initDb
};
