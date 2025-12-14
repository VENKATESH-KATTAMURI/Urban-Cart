const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const collection = () => getCollection('users');

async function findOne(query = {}) { return await collection().findOne(query); }
async function findById(id) { try { return await collection().findOne({ _id: new ObjectId(id) }); } catch { return null; } }

async function create(userData) {
  const doc = { ...userData, createdAt: new Date(), wishlist: [] };
  const res = await collection().insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

async function updateById(id, updates) {
  try {
    const res = await collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return res.value;
  } catch { return null; }
}

async function addToWishlist(userId, productId) {
  try {
    const pidObj = new ObjectId(productId);
    await collection().findOneAndUpdate(
      { _id: new ObjectId(userId), wishlist: { $ne: pidObj } },
      { $push: { wishlist: pidObj } },
      { returnDocument: 'after' }
    );
  } catch {}
}

async function removeFromWishlist(userId, productId) {
  try {
    await collection().findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $pull: { wishlist: new ObjectId(productId) } },
      { returnDocument: 'after' }
    );
  } catch {}
}

async function getWishlist(userId) {
  const user = await findById(userId);
  return user?.wishlist || [];
}

module.exports = { findOne, findById, create, updateById, addToWishlist, removeFromWishlist, getWishlist };
