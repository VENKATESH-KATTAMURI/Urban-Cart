const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const collection = () => getCollection('reviews');
const productsCollection = () => getCollection('products');

async function findByProduct(productId, sort = { createdAt: -1 }) {
  const reviews = await collection().find({ product: new ObjectId(productId) }).sort(sort).toArray();
  
  // Populate user names
  const userCollection = getCollection('users');
  for (let review of reviews) {
    const user = await userCollection.findOne({ _id: review.user });
    review.user = user ? { _id: user._id, name: user.name } : review.user;
  }
  
  return reviews;
}

async function findOneByProductAndUser(productId, userId) {
  return await collection().findOne({ product: new ObjectId(productId), user: new ObjectId(userId) });
}

async function create(reviewData) {
  const doc = {
    product: new ObjectId(reviewData.product),
    user: new ObjectId(reviewData.user),
    rating: reviewData.rating,
    comment: reviewData.comment,
    createdAt: new Date()
  };
  const res = await collection().insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

async function updateProductRating(productId) {
  const reviews = await collection().find({ product: new ObjectId(productId) }).toArray();
  if (reviews.length === 0) return;
  
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await productsCollection().updateOne(
    { _id: new ObjectId(productId) },
    { $set: { 'rating.average': avgRating, 'rating.count': reviews.length } }
  );
}

module.exports = { findByProduct, findOneByProductAndUser, create, updateProductRating };
