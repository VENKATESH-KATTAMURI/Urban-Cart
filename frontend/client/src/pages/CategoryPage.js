import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import ProductCard from '../components/ProductCard';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100000,
    sort: 'newest'
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCategoryProducts();
  }, [slug, filters]);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get category name first
      const categoriesRes = await axiosInstance.get('/categories');
      console.log('Categories fetched:', categoriesRes.data);
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.categories || [];
      console.log('Categories data:', categoriesData);
      console.log('Looking for slug:', slug);
      const category = categoriesData.find(cat => cat.slug === slug);
      console.log('Found category:', category);
      
      if (category) {
        setCategoryName(category.name);

        // Fetch products for this category
        const params = new URLSearchParams({
          category: category._id,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sort: filters.sort,
          limit: 100
        });

        console.log('Fetching products with params:', params.toString());
        const productsRes = await axiosInstance.get(`/products?${params}`);
        console.log('Products response:', productsRes.data);
        setProducts(productsRes.data.products || []);
      } else {
        setError('Category not found');
        console.error('Category slug not found:', slug);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'sort' ? value : parseInt(value)
    }));
  };

  return (
    <div className="category-page">
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1 className="category-title">{categoryName || 'Category'}</h1>

        <div className="category-content">
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Filters</h3>

              <div className="filter-group">
                <label>Price Range</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </aside>

          <div className="products-area">
            {loading && <div className="loading">Loading products...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && products.length === 0 && (
              <div className="no-products">No products found in this category.</div>
            )}
            {!loading && products.length > 0 && (
              <>
                <div className="products-count">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </div>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
