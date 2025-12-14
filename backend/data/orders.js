const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const collection = () => getCollection('orders');
const productsCollection = () => getCollection('products');

async function create(orderData) {
  const doc = {
    ...orderData,
    user: new ObjectId(orderData.user),
    items: orderData.items.map(item => ({
      ...item,
      product: new ObjectId(item.product)
    })),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const res = await collection().insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

async function findByUserId(userId, sort = { createdAt: -1 }) {
  const orders = await collection().find({ user: new ObjectId(userId) }).sort(sort).toArray();
  
  // Populate products
  for (let order of orders) {
    const productIds = order.items.map(i => i.product);
    const products = await productsCollection().find({ _id: { $in: productIds } }).toArray();
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));
    order.items = order.items.map(i => ({ ...i, product: productMap[i.product.toString()] || i.product }));
  }
  
  return orders;
}

async function findById(id) {
  try {
    const order = await collection().findOne({ _id: new ObjectId(id) });
    if (!order) return null;
    
    // Populate products
    const productIds = order.items.map(i => i.product);
    const products = await productsCollection().find({ _id: { $in: productIds } }).toArray();
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));
    order.items = order.items.map(i => ({ ...i, product: productMap[i.product.toString()] || i.product }));
    
    return order;
  } catch { return null; }
}

async function updatePayment(orderId, paymentId) {
  try {
    const res = await collection().findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { paymentStatus: 'completed', status: 'paid', paymentId, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return res.value;
  } catch { return null; }
}

module.exports = { create, findByUserId, findById, updatePayment };
