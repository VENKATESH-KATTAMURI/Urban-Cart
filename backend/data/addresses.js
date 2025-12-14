const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const collection = () => getCollection('addresses');

async function findByUser(userId) {
  return await collection().find({ user: new ObjectId(userId) }).toArray();
}

async function create(addressData) {
  const doc = { ...addressData, user: new ObjectId(addressData.user), createdAt: new Date() };
  const res = await collection().insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

module.exports = { findByUser, create };
