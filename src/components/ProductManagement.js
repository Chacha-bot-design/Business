import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (error) return (
    <div className="error-container">
      <h3>Connection Error</h3>
      <p>Error: {error}</p>
      <button className="btn-retry" onClick={fetchProducts}>
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="product-management">
      <div className="section-header">
        <h2>Product Catalog</h2>
        <div>
          
          <div style={{marginLeft: '1rem', color: '#666', fontSize: '0.9rem'}}>
            
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-grid">
          {products && products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="product-card">
                <h4>{product.name}</h4>
                <p className="product-description">{product.description}</p>
                <div className="product-details">
                  <div className="stock-info">
                    <span className="label">Current Stock:</span>
                    <span className={`value ${product.current_stock < 10 ? 'low-stock' : ''}`}>
                      {product.current_stock} units
                      {product.current_stock < 10 && <span className="stock-warning"> ⚠️ Low Stock</span>}
                    </span>
                  </div>
                  <div className="price-info">
                    <span className="label">Selling Price:</span>
                    <span className="value">Tsh{product.price}</span>
                  </div>
                  <div className="cost-info">
                    <span className="label">Cost Price:</span>
                    <span className="value">Tsh{product.cost_price}</span>
                  </div>
                  <div className="profit-info">
                    <span className="label">Profit per Unit:</span>
                    <span className="value profit">
                      Tsh{(product.price - product.cost_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>No products found in the database.</p>
              <p>Please add products through the Django Admin panel.</p>
              <div style={{marginTop: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '5px'}}>
                <strong>How to add products:</strong>
                <ol style={{textAlign: 'left', margin: '0.5rem 0'}}>
                  <li>Go to http://localhost:8000/admin</li>
                  <li>Login with your admin credentials</li>
                  <li>Click on "Products"</li>
                  <li>Click "Add Product"</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;