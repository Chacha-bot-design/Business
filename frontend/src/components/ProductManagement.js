// components/ProductManagement.js
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category_name: '',
    price: '',
    cost_price: '',
    stock_quantity: '',
    min_stock_level: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      setError('Failed to fetch products. Please check if the backend is running.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await productsAPI.create({
        ...formData,
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price),
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_level: parseInt(formData.min_stock_level)
      });
      
      setFormData({
        name: '', category_name: '', price: '', cost_price: '', 
        stock_quantity: '', min_stock_level: ''
      });
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      setError('Failed to create product: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(productId);
        fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        setError('Failed to delete product: ' + error.message);
      }
    }
  };

  return (
    <div className="product-management">
      <h2>Product Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="management-section">
        <h3>Add New Product</h3>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="category_name"
              placeholder="Category"
              value={formData.category_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="price"
              placeholder="Selling Price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="cost_price"
              placeholder="Cost Price"
              value={formData.cost_price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="stock_quantity"
              placeholder="Stock Quantity"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="min_stock_level"
              placeholder="Min Stock Level"
              value={formData.min_stock_level}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Add Product</button>
        </form>
      </div>

      <div className="products-list">
        <h3>Existing Products ({products.length})</h3>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p className="no-data">No products found. Add your first product above.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Stock</th>
                  <th>Min Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category_name}</td>
                    <td>${product.price?.toLocaleString()}</td>
                    <td>${product.cost_price?.toLocaleString()}</td>
                    <td className={product.stock_quantity <= product.min_stock_level ? 'low-stock' : ''}>
                      {product.stock_quantity}
                    </td>
                    <td>{product.min_stock_level}</td>
                    <td>
                      <button 
                        className="btn-danger"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;