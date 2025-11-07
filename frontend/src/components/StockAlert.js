import React, { useState, useEffect } from 'react';
import { reportsAPI, productAPI } from '../services/api';

const StockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
    fetchAllProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await reportsAPI.lowStock();
      setLowStockProducts(response.data);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setAllProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  if (loading) return <div className="loading">Loading stock information...</div>;

  return (
    <div className="stock-alert">
      <h2>Stock Management & Alerts</h2>

      {/* Low Stock Alerts */}
      <div className="alerts-section">
        <h3>Stock Alerts</h3>
        {lowStockProducts.length === 0 ? (
          <div className="no-alerts">
            <p>No low stock alerts! All products have adequate inventory.</p>
          </div>
        ) : (
          <div className="alert-list">
            {lowStockProducts.map(product => (
              <div 
                key={product.id} 
                className={`alert-item ${getStockLevel(product.current_stock)}`}
              >
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                </div>
                <div className="stock-info">
                  <span className={`stock-level ${getStockLevel(product.current_stock)}`}>
                    {product.current_stock} units
                  </span>
                  <span className="stock-message">
                    {getStockMessage(product.current_stock)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Products Stock Overview */}
      <div className="all-products-section">
        <h3>All Products Stock Overview</h3>
        <div className="products-grid">
          {allProducts.map(product => (
            <div 
              key={product.id} 
              className={`product-stock-card ${getStockLevel(product.current_stock)}`}
            >
              <h4>{product.name}</h4>
              <p className="product-description">{product.description}</p>
              <div className="stock-details">
                <div className="stock-quantity">
                  <span className="label">Current Stock:</span>
                  <span className={`value ${getStockLevel(product.current_stock)}`}>
                    {product.current_stock} units
                  </span>
                </div>
                <div className="price-info">
                  <span className="label">Price:</span>
                  <span className="value">${product.price}</span>
                </div>
                <div className="stock-status">
                  <span className={`status ${getStockLevel(product.current_stock)}`}>
                    {getStockMessage(product.current_stock)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Summary */}
      <div className="stock-summary">
        <h3>Stock Summary</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <h4>Total Products</h4>
            <p className="count">{allProducts.length}</p>
          </div>
          <div className="summary-card critical">
            <h4>Critical Stock</h4>
            <p className="count">
              {allProducts.filter(p => p.current_stock < 5).length}
            </p>
          </div>
          <div className="summary-card low">
            <h4>Low Stock</h4>
            <p className="count">
              {allProducts.filter(p => p.current_stock >= 5 && p.current_stock < 10).length}
            </p>
          </div>
          <div className="summary-card adequate">
            <h4>Adequate Stock</h4>
            <p className="count">
              {allProducts.filter(p => p.current_stock >= 10).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlert;