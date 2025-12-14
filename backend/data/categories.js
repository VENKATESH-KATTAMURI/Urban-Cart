const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const collection = () => getCollection('categories');

async function find(query = {}, options = {}) {
  const { sort = {}, limit = 0, skip = 0 } = options;
  return await collection().find(query).sort(sort).limit(Number(limit)).skip(Number(skip)).toArray();
}

async function findOne(query = {}) { return await collection().findOne(query); }
async function findById(id) { try { return await collection().findOne({ _id: new ObjectId(id) }); } catch { return null; } }
async function count(query = {}) { return await collection().countDocuments(query); }

module.exports = { find, findOne, findById, count };
