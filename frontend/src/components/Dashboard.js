// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('Checking...');

  const fetchReports = async () => {
    try {
      console.log('🔄 Fetching reports...');
      setLoading(true);
      setError(null);
      
      // Use the FIXED API function
      const response = await reportsAPI.generateAll();
      console.log('✅ Reports data received:', response.data);
      
      setReportData(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setDataSource(response.status === 200 ? 'Live API Data' : 'Mock Data');
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError(err.message || 'Failed to load reports. Using demo data.');
      
      // Even on error, set mock data
      setReportData(generateFallbackData());
      setDataSource('Fallback Demo Data');
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data generator
  const generateFallbackData = () => {
    const today = new Date();
    return {
      daily: {
        date: today.toISOString().split('T')[0],
        sales: 1250000,
        purchases: 850000,
        transactions: 45,
        profit_loss: 400000
      },
      weekly: {
        period: `Week ${Math.ceil(today.getDate() / 7)}`,
        sales: 8750000,
        purchases: 5950000,
        transactions: 315,
        profit_loss: 2800000
      },
      monthly: {
        period: today.toLocaleString('default', { month: 'long' }),
        sales: 35000000,
        purchases: 23800000,
        transactions: 1260,
        profit_loss: 11200000
      },
      yearly: {
        year: today.getFullYear(),
        sales: 420000000,
        purchases: 285600000,
        transactions: 15120,
        profit_loss: 134400000
      }
    };
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (amount) => {
    return `Tsh ${amount?.toLocaleString() || '0'}`;
  };

  const formatNumber = (number) => {
    return number?.toLocaleString() || '0';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <i className="bi bi-arrow-repeat spin"></i>
          <h3>Loading Business Dashboard...</h3>
          <p>Connecting to Frecha Iotech business system</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Frecha Iotech Business Dashboard</h1>
          <p>Real-time business performance analytics</p>
        </div>
        <div className="header-actions">
          <div className="data-source-info">
            <span className={`data-source ${dataSource.includes('Live') ? 'live' : 'mock'}`}>
              <i className={`bi ${dataSource.includes('Live') ? 'bi-database-check' : 'bi-database'}`}></i>
              {dataSource}
            </span>
            {lastUpdated && (
              <small className="last-updated">
                Updated: {lastUpdated}
              </small>
            )}
          </div>
          <button className="btn btn-primary" onClick={fetchReports}>
            <i className="bi bi-arrow-clockwise"></i>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Error Banner (if any) */}
      {error && (
        <div className="api-alert warning">
          <i className="bi bi-exclamation-triangle"></i>
          <div className="alert-content">
            <strong>Using Demo Data</strong>
            <small>{error}</small>
          </div>
        </div>
      )}

      {/* Quick Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(reportData?.daily?.sales)}</h3>
            <p>Today's Sales</p>
            <span className="stat-trend positive">+12% from yesterday</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(reportData?.daily?.profit_loss)}</h3>
            <p>Today's Profit</p>
            <span className="stat-trend positive">+8% from yesterday</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className="bi bi-cart-check"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(reportData?.daily?.transactions)}</h3>
            <p>Today's Transactions</p>
            <span className="stat-trend positive">+5% from yesterday</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(reportData?.daily?.purchases)}</h3>
            <p>Today's Purchases</p>
            <span className="stat-trend">Inventory restock</span>
          </div>
        </div>
      </div>

      {/* Detailed Reports Grid */}
      <div className="reports-grid">
        {/* Daily Report */}
        <div className="report-card">
          <div className="report-header">
            <h3>
              <i className="bi bi-calendar-day"></i>
              Daily Report
            </h3>
            <span className="report-date">{reportData?.daily?.date}</span>
          </div>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Sales</span>
              <span className="metric-value">{formatCurrency(reportData?.daily?.sales)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Purchases</span>
              <span className="metric-value">{formatCurrency(reportData?.daily?.purchases)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Transactions</span>
              <span className="metric-value">{formatNumber(reportData?.daily?.transactions)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Profit/Loss</span>
              <span className={`metric-value ${reportData?.daily?.profit_loss >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(reportData?.daily?.profit_loss)}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Report */}
        <div className="report-card">
          <div className="report-header">
            <h3>
              <i className="bi bi-calendar-week"></i>
              Weekly Report
            </h3>
            <span className="report-period">{reportData?.weekly?.period}</span>
          </div>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Sales</span>
              <span className="metric-value">{formatCurrency(reportData?.weekly?.sales)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Purchases</span>
              <span className="metric-value">{formatCurrency(reportData?.weekly?.purchases)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Transactions</span>
              <span className="metric-value">{formatNumber(reportData?.weekly?.transactions)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Profit/Loss</span>
              <span className={`metric-value ${reportData?.weekly?.profit_loss >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(reportData?.weekly?.profit_loss)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Report */}
        <div className="report-card">
          <div className="report-header">
            <h3>
              <i className="bi bi-calendar-month"></i>
              Monthly Report
            </h3>
            <span className="report-period">{reportData?.monthly?.period}</span>
          </div>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Sales</span>
              <span className="metric-value">{formatCurrency(reportData?.monthly?.sales)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Purchases</span>
              <span className="metric-value">{formatCurrency(reportData?.monthly?.purchases)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Transactions</span>
              <span className="metric-value">{formatNumber(reportData?.monthly?.transactions)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Profit/Loss</span>
              <span className={`metric-value ${reportData?.monthly?.profit_loss >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(reportData?.monthly?.profit_loss)}
              </span>
            </div>
          </div>
        </div>

        {/* Yearly Report */}
        <div className="report-card">
          <div className="report-header">
            <h3>
              <i className="bi bi-calendar-year"></i>
              Yearly Report
            </h3>
            <span className="report-year">{reportData?.yearly?.year}</span>
          </div>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Sales</span>
              <span className="metric-value">{formatCurrency(reportData?.yearly?.sales)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Purchases</span>
              <span className="metric-value">{formatCurrency(reportData?.yearly?.purchases)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Transactions</span>
              <span className="metric-value">{formatNumber(reportData?.yearly?.transactions)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Profit/Loss</span>
              <span className={`metric-value ${reportData?.yearly?.profit_loss >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(reportData?.yearly?.profit_loss)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <div className={`status-indicator ${dataSource.includes('Live') ? 'success' : 'warning'}`}>
          <i className={`bi ${dataSource.includes('Live') ? 'bi-check-circle' : 'bi-info-circle'}`}></i>
          {dataSource.includes('Live') ? 'Connected to Live API' : 'Using Demo Data - API endpoints not available'}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;