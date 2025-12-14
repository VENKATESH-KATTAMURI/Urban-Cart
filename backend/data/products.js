const { getCollection } = require('../config/db');
const { ObjectId } = require('mongodb');

const collection = () => getCollection('products');
const categories = () => getCollection('categories');

async function find(query = {}, { sort = {}, limit = 0, skip = 0, populateCategory = false } = {}) {
  if (populateCategory) {
    const pipeline = [
      { $match: query },
      ...(Object.keys(sort).length > 0 ? [{ $sort: sort }] : []),
      ...(limit ? [{ $limit: Number(limit) }] : []),
      ...(skip ? [{ $skip: Number(skip) }] : []),
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { 'category.name': 1, 'category.slug': 1, name: 1, slug: 1, description: 1, price: 1, mrpPrice: 1, stock: 1, brand: 1, thumbnailImage: 1, images: 1, rating: 1, views: 1, popularityScore: 1, tags: 1, isActive: 1, isFeatured: 1, createdAt: 1, updatedAt: 1 } }
    ];
    return await collection().aggregate(pipeline).toArray();
  }
  return await collection().find(query).sort(sort).limit(Number(limit)).skip(Number(skip)).toArray();
}

async function count(query = {}) {
  return await collection().countDocuments(query);
}

async function findOne(query = {}, { populateCategory = false } = {}) {
  if (populateCategory) {
    const docs = await find(query, { limit: 1, populateCategory });
    return docs[0] || null;
  }
  return await collection().findOne(query);
}

async function findById(id, { populateCategory = false } = {}) {
  try {
    const _id = new ObjectId(id);
    return await findOne({ _id }, { populateCategory });
  } catch {
    return null;
  }
}

async function incrementViewsBySlug(slug) {
  const res = await collection().findOneAndUpdate({ slug, isActive: true }, { $inc: { views: 1 } }, { returnDocument: 'after' });
  return res.value;
}

// Group products by category with category details
async function findGroupedByCategory() {
  const pipeline = [
    { $match: { isActive: true } },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $group: {
        _id: '$category._id',
        category: { $first: { _id: '$category._id', name: '$category.name', slug: '$category.slug' } },
        products: { $push: { _id: '$_id', name: '$name', slug: '$slug', price: '$price', mrpPrice: '$mrpPrice', brand: '$brand', thumbnailImage: '$thumbnailImage' } }
      }
    },
    { $sort: { 'category.name': 1 } }
  ];
  return await collection().aggregate(pipeline).toArray();
}

module.exports = { find, count, findOne, findById, incrementViewsBySlug, findGroupedByCategory };
