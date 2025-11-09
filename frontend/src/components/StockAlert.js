import React, { useState, useEffect } from 'react';
import { reportsAPI, productAPI, healthAPI } from '../services/api';
import './StockAlert.css'; // Optional: for styling

const StockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendAndFetchData();
  }, []);

  const checkBackendAndFetchData = async () => {
    try {
      // First check if backend is reachable
      console.log('🔍 Checking backend connection...');
      await healthAPI.check();
      setBackendStatus('healthy');
      
      // If backend is healthy, fetch data
      await fetchAllData();
    } catch (err) {
      console.error('Backend connection failed:', err);
      setBackendStatus('unhealthy');
      setError(`Backend is not accessible: ${err.message}`);
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both datasets in parallel
      const [lowStockResponse, allProductsResponse] = await Promise.all([
        reportsAPI.lowStock(),
        productAPI.getAll()
      ]);
      
      setLowStockProducts(lowStockResponse.data?.products || lowStockResponse.data || []);
      setAllProducts(allProductsResponse.data || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 5) return 'critical';
    if (stock < 10) return 'low';
    return 'adequate';
  };

  const getStockMessage = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 5) return 'Critical Level';
    if (stock < 10) return 'Low Stock';
    return 'Adequate Stock';
  };

  // Render loading state
  if (loading && backendStatus === 'checking') {
    return (
      <div className="loading-container">
        <div className="loading">Checking backend connection...</div>
      </div>
    );
  }

  // Render backend connection error
  if (backendStatus === 'unhealthy') {
    return (
      <div className="error-container">
        <h2>Connection Issue</h2>
        <div className="error-message">
          <p>{error}</p>
          <div className="debug-info">
            <p><strong>Trying to connect to:</strong></p>
            <code>{process.env.REACT_APP_API_URL || 'https://frecha-iotech.onrender.com/api'}</code>
          </div>
          <button 
            onClick={checkBackendAndFetchData}
            className="retry-button"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="stock-alert">
      <div className="header">
        <h2>Stock Management & Alerts</h2>
        <button 
          onClick={fetchAllData}
          className="refresh-button"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="data-error">
          <p>⚠️ {error}</p>
          <button onClick={fetchAllData}>Retry</button>
        </div>
      )}

      {/* Low Stock Alerts */}
      <div className="alerts-section">
        <h3>🚨 Stock Alerts</h3>
        {lowStockProducts.length === 0 ? (
          <div className="no-alerts">
            <p>✅ No low stock alerts! All products have adequate inventory.</p>
          </div>
        ) : (
          <div className="alert-list">
            {lowStockProducts.map(product => (
              <div 
                key={product.id} 
                className={`alert-item ${getStockLevel(product.current_stock || product.stock_quantity)}`}
              >
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                </div>
                <div className="stock-info">
                  <span className={`stock-level ${getStockLevel(product.current_stock || product.stock_quantity)}`}>
                    {product.current_stock || product.stock_quantity} units
                  </span>
                  <span className="stock-message">
                    {getStockMessage(product.current_stock || product.stock_quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Products Stock Overview */}
      <div className="all-products-section">
        <h3>📦 All Products Stock Overview</h3>
        {allProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found.</p>
          </div>
        ) : (
          <div className="products-grid">
            {allProducts.map(product => (
              <div 
                key={product.id} 
                className={`product-stock-card ${getStockLevel(product.current_stock || product.stock_quantity)}`}
              >
                <h4>{product.name}</h4>
                <p className="product-description">{product.description}</p>
                <div className="stock-details">
                  <div className="stock-quantity">
                    <span className="label">Current Stock:</span>
                    <span className={`value ${getStockLevel(product.current_stock || product.stock_quantity)}`}>
                      {product.current_stock || product.stock_quantity} units
                    </span>
                  </div>
                  <div className="price-info">
                    <span className="label">Price:</span>
                    <span className="value">${product.price}</span>
                  </div>
                  <div className="stock-status">
                    <span className={`status ${getStockLevel(product.current_stock || product.stock_quantity)}`}>
                      {getStockMessage(product.current_stock || product.stock_quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Summary */}
      <div className="stock-summary">
        <h3>📊 Stock Summary</h3>
        <div className="summary-cards">
          <div className="summary-card total">
            <h4>Total Products</h4>
            <p className="count">{allProducts.length}</p>
          </div>
          <div className="summary-card critical">
            <h4>Critical Stock (&lt;5)</h4>
            <p className="count">
              {allProducts.filter(p => (p.current_stock || p.stock_quantity) < 5).length}
            </p>
          </div>
          <div className="summary-card low">
            <h4>Low Stock (5-9)</h4>
            <p className="count">
              {allProducts.filter(p => (p.current_stock || p.stock_quantity) >= 5 && (p.current_stock || p.stock_quantity) < 10).length}
            </p>
          </div>
          <div className="summary-card adequate">
            <h4>Adequate Stock (10+)</h4>
            <p className="count">
              {allProducts.filter(p => (p.current_stock || p.stock_quantity) >= 10).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlert;