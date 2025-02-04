// getting-started.js
const mongoose = require('mongoose');

require('dotenv').config();
main().catch(err => console.log(err));

async function main() {
  //await mongoose.connect('mongodb://127.0.0.1:27017/toy_store');
  await mongoose.connect(process.env.DB_CONNECT);
  console.log("Connected to database")

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}