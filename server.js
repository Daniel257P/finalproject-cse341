const app = require('./app');
const mongodb = require('./data/database');
const PORT = process.env.PORT||3003;

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(PORT, () => {
      console.log(`Database is listening and node is running on port http://127.0.0.1:${PORT}`);
    });
  }
});