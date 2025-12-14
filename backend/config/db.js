const { MongoClient } = require('mongodb');

let client;
let db;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/urbancart';
    client = new MongoClient(uri);
    await client.connect();
    // Use database from URI path or fallback to 'urbancart'
    const dbName = (uri.split('/')?.pop()?.split('?')[0]) || 'urbancart';
    db = client.db(dbName);
    console.log(`MongoDB Connected: ${client?.options?.srvHost || 'localhost'}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
};

const getCollection = (name) => getDB().collection(name);

module.exports = connectDB;
module.exports.getDB = getDB;
module.exports.getCollection = getCollection;
