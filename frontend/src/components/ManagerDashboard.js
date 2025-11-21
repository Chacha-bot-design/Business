import React, { useState, useEffect } from 'react';
import { productsAPI, salesAPI } from '../services/api';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, lowStockRes, salesRes] = await Promise.all([
        productsAPI.getAll(),
        productsAPI.getLowStock(),
        salesAPI.getAll()
      ]);
      
      setProducts(productsRes.data);
      setLowStock(lowStockRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const totalTransactions = sales.length;

  return (
    <div className="manager-dashboard">
      <h2>Manager Dashboard</h2>
      
      <div className="sales-summary">
        <h3>Sales Overview</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-content">
              <h4>Total Sales</h4>
              <p className="summary-value">${totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-content">
              <h4>Total Transactions</h4>
              <p className="summary-value">{totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="low-stock-section">
        <h3>Low Stock Alert</h3>
        {lowStock.length === 0 ? (
          <p className="no-alert">All products are well stocked</p>
        ) : (
          <div className="alert-warning">
            <h4>Products needing restock:</h4>
            <ul className="alert-list">
              {lowStock.map(product => (
                <li key={product.id} className="alert-item">
                  <strong>{product.name}</strong> - Current: {product.current_stock}, Minimum: {product.min_stock}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="products-section">
        <h3>Product Inventory</h3>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>
                    <td className="product-category">{product.category_name}</td>
                    <td className="product-price">${product.price}</td>
                    <td className={`stock-level ${
                      product.stock_quantity < product.min_stock_level 
                        ? 'low-stock' 
                        : product.stock_quantity < product.min_stock_level * 2 
                          ? 'medium-stock' 
                          : 'good-stock'
                    }`}>
                      {product.stock_quantity}
                      {product.stock_quantity < product.min_stock_level && ' ⚠️'}
                    </td>
                    <td>
                      <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="recent-sales">
        <h3>Recent Sales</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Seller</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 10).map(sale => (
                <tr key={sale.id}>
                  <td className="sale-id">#{sale.id}</td>
                  <td className="seller-name">{sale.seller_name}</td>
                  <td className="sale-date">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  <td className="sale-amount">${sale.total_amount}</td>
                  <td>
                    <span className={`payment-badge ${
                      sale.payment_method === 'CASH' ? 'cash' : 
                      sale.payment_method === 'CARD' ? 'card' : 'mobile'
                    }`}>
                      {sale.payment_method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;