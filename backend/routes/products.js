const express = require('express');
const router = express.Router();
const ProductRepo = require('../data/products');
const { ObjectId } = require('mongodb');

// ===== SPECIFIC NAMED ROUTES (MUST BE BEFORE /:slug) =====

// @route   GET /api/products/grouped-by-category/list
// @desc    Get all products grouped by category
// @access  Public
router.get('/grouped-by-category/list', async (req, res) => {
  try {
    const grouped = await ProductRepo.findGroupedByCategory();
    res.json(grouped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/featured/list
// @desc    Get featured products
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const products = await ProductRepo.find({ isActive: true, isFeatured: true }, {
      sort: { popularityScore: -1 },
      limit: 8,
      populateCategory: true
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/trending/list
// @desc    Get trending products
// @access  Public
router.get('/trending/list', async (req, res) => {
  try {
    const products = await ProductRepo.find({ isActive: true }, {
      sort: { views: -1, popularityScore: -1 },
      limit: 12,
      populateCategory: true
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/recommended/:productId
// @desc    Get recommended products (rule-based)
// @access  Public
router.get('/recommended/:productId', async (req, res) => {
  try {
    const currentProduct = await ProductRepo.findById(req.params.productId);

    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get related products from same category with similar price range
    const priceRange = currentProduct.price * 0.3;

    const recommendations = await ProductRepo.find({
      _id: { $ne: currentProduct._id },
      category: currentProduct.category,
      price: {
        $gte: currentProduct.price - priceRange,
        $lte: currentProduct.price + priceRange
      },
      isActive: true
    }, { sort: { popularityScore: -1 }, limit: 8, populateCategory: true });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== GENERIC ROUTES (LESS SPECIFIC) =====

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 12,
      ids
    } = req.query;

    // Wishlist support: fetch by explicit ids (comma separated)
    if (ids) {
      const idList = ids.split(',').map(id => id.trim()).filter(Boolean);
      if (idList.length === 0) {
        return res.json({ products: [] });
      }

      // Convert only valid ObjectIds; keep strings otherwise
      const parsedIds = idList.reduce((acc, id) => {
        try {
          acc.push(new ObjectId(id));
        } catch {
          acc.push(id); // non-ObjectId strings will still match if stored that way
        }
        return acc;
      }, []);

      const products = await ProductRepo.find(
        { _id: { $in: parsedIds }, isActive: true },
        { populateCategory: true }
      );

      return res.json({ products });
    }

    let query = { isActive: true };

    // Category filter
    if (category) {
      try {
        query.category = new ObjectId(category);
      } catch {
        query.category = category; // fallback for string slugs
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Sort
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { popularityScore: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await ProductRepo.find(query, {
      sort: sortOption,
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      populateCategory: true
    });

    const count = await ProductRepo.count(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== CATCH-ALL ROUTE (MUST BE LAST) =====

// @route   GET /api/products/:slug
// @desc    Get product by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    let product = await ProductRepo.findOne({ slug: req.params.slug, isActive: true }, { populateCategory: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product = await ProductRepo.incrementViewsBySlug(req.params.slug);

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
