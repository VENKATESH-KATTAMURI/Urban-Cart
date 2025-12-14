const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const collection = () => getCollection('carts');
const productsCollection = () => getCollection('products');

async function findByUserId(userId) {
  return await collection().findOne({ user: new ObjectId(userId) });
}

async function createForUser(userId) {
  const doc = { user: new ObjectId(userId), items: [], createdAt: new Date(), updatedAt: new Date() };
  const res = await collection().insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

async function findWithPopulatedItems(userId) {
  const cart = await findByUserId(userId);
  if (!cart) return null;
  
  if (cart.items.length > 0) {
    const productIds = cart.items.map(i => new ObjectId(i.product));
    const products = await productsCollection().find({ _id: { $in: productIds } }).toArray();
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));
    cart.items = cart.items.map(i => ({ ...i, product: productMap[i.product.toString()] || i.product }));
  }
  return cart;
}

async function addItem(userId, productId, quantity) {
  const userOid = new ObjectId(userId);
  const prodOid = new ObjectId(productId);
  
  let cart = await findByUserId(userId);
  if (!cart) {
    cart = await createForUser(userId);
  }
  
  const itemIndex = cart.items.findIndex(i => i.product.toString() === prodOid.toString());
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: prodOid, quantity });
  }
  
  await collection().updateOne(
    { _id: cart._id },
    { $set: { items: cart.items, updatedAt: new Date() } }
  );
  
  return await findWithPopulatedItems(userId);
}

async function updateItem(userId, itemId, quantity) {
  const cart = await findByUserId(userId);
  if (!cart) return null;
  
  const item = cart.items.find(i => i._id && i._id.toString() === itemId);
  if (!item) return null;
  
  item.quantity = quantity;
  await collection().updateOne(
    { _id: cart._id },
    { $set: { items: cart.items, updatedAt: new Date() } }
  );
  
  return await findWithPopulatedItems(userId);
}

async function removeItem(userId, itemId) {
  const cart = await findByUserId(userId);
  if (!cart) return null;
  
  cart.items = cart.items.filter(i => !i._id || i._id.toString() !== itemId);
  await collection().updateOne(
    { _id: cart._id },
    { $set: { items: cart.items, updatedAt: new Date() } }
  );
  
  return await findWithPopulatedItems(userId);
}

async function clearCart(userId) {
  await collection().updateOne(
    { user: new ObjectId(userId) },
    { $set: { items: [], updatedAt: new Date() } }
  );
}

module.exports = { findByUserId, createForUser, findWithPopulatedItems, addItem, updateItem, removeItem, clearCart };
