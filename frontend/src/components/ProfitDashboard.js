// components/ProfitDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, salesAPI, productsAPI } from '../services/api';

const ProfitDashboard = () => {
  const [profitData, setProfitData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [profitRes, salesRes, productsRes] = await Promise.all([
          reportsAPI.profitLossReport().catch(() => ({ data: null })),
          salesAPI.getAll().catch(() => ({ data: [] })),
          productsAPI.getAll().catch(() => ({ data: [] }))
        ]);
        
        setProfitData(profitRes?.data);
        setSalesData(salesRes.data?.sales || salesRes.data || []);
        setProducts(productsRes.data || []);
        
      } catch (error) {
        setError('Unable to connect to the server. Please make sure the backend is running.');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  
  if (error) return (
    <div className="error-container">
      <div className="error-message">
        <h3>No Data Available</h3>
        <p>{error}</p>
        <p>Please add data through the Admin Dashboard to see analytics.</p>
        <Link to="/admin">
          <button className="btn-primary">Go to Admin Dashboard</button>
        </Link>
      </div>
    </div>
  );

  // Safe data access
  const dailyData = profitData?.daily || {};
  const { total_sales = 0, total_profit = 0, transaction_count = 0 } = dailyData;

  return (
    <div className="profit-dashboard">
      <div className="dashboard-header">
        <h1>Business Dashboard</h1>
        <Link to="/admin">
          <button className="btn-secondary">Admin Panel</button>
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-number">${total_sales.toLocaleString()}</p>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-card">
          <h3>Total Profit</h3>
          <p className="stat-number">${total_profit.toLocaleString()}</p>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-card">
          <h3>Transactions</h3>
          <p className="stat-number">{transaction_count}</p>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-card">
          <h3>Products</h3>
          <p className="stat-number">{products.length}</p>
          <span className="stat-label">Active</span>
        </div>
      </div>

      {salesData.length === 0 && products.length === 0 && (
        <div className="empty-state">
          <h3>Welcome to Your Business Dashboard!</h3>
          <p>Get started by adding products and recording sales through the Admin Panel.</p>
          <Link to="/admin">
            <button className="btn-primary">Add Your First Product</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfitDashboard;