import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [activeReport, setActiveReport] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [comprehensiveReport, setComprehensiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDailyReport();
  }, []);

  const loadReport = async (reportType, loaderFunction) => {
    setLoading(true);
    setError(null);
    try {
      await loaderFunction();
    } catch (err) {
      setError(`Failed to load ${reportType} report: ${err.message}`);
      console.error(`Error loading ${reportType} report:`, err);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyReport = async () => {
    try {
      const response = await reportsAPI.getDailyReport();
      setDailyReport(response.data);
      setActiveReport('daily');
    } catch (error) {
      throw error;
    }
  };

  const loadWeeklyReport = async () => {
    try {
      const response = await reportsAPI.getWeeklyReport();
      setWeeklyReport(response.data);
      setActiveReport('weekly');
    } catch (error) {
      throw error;
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const response = await reportsAPI.getMonthlyReport();
      setMonthlyReport(response.data);
      setActiveReport('monthly');
    } catch (error) {
      throw error;
    }
  };

  const loadComprehensiveReport = async () => {
    try {
      const response = await reportsAPI.getComprehensiveReport();
      setComprehensiveReport(response.data);
      setActiveReport('comprehensive');
    } catch (error) {
      throw error;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercent = (value) => {
    return `${value?.toFixed(1) || 0}%`;
  };

  const renderDailyReport = () => {
    if (!dailyReport) return <div className="no-data">No daily report data available</div>;
    
    return (
      <div className="report-content">
        <div className="report-header">
          <h3>Daily Report - {new Date(dailyReport.date).toLocaleDateString()}</h3>
          <button onClick={() => loadReport('daily', loadDailyReport)} className="refresh-button">
            Refresh
          </button>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Today's Sales</h4>
            <p className="metric-value">{formatCurrency(dailyReport.today_sales?.total_sales)}</p>
            <p className="metric-label">Total Revenue</p>
          </div>
          <div className="metric-card">
            <h4>Today's Profit</h4>
            <p className="metric-value profit">{formatCurrency(dailyReport.today_sales?.total_profit)}</p>
            <p className="metric-label">Net Profit</p>
          </div>
          <div className="metric-card">
            <h4>Transactions</h4>
            <p className="metric-value">{dailyReport.today_sales?.transaction_count || 0}</p>
            <p className="metric-label">Total Orders</p>
          </div>
          <div className="metric-card">
            <h4>Growth</h4>
            <p className={`metric-value ${dailyReport.sales_growth > 0 ? 'positive' : 'negative'}`}>
              {formatPercent(dailyReport.sales_growth)}
            </p>
            <p className="metric-label">vs Yesterday</p>
          </div>
        </div>

        {dailyReport.top_products_today && dailyReport.top_products_today.length > 0 && (
          <div className="report-section">
            <h4>Top Products Today</h4>
            <div className="products-list">
              {dailyReport.top_products_today.map((product, index) => (
                <div key={index} className="product-item">
                  <span className="product-name">{product.product__name}</span>
                  <span className="product-stats">
                    Sold: {product.quantity_sold} | Revenue: {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dailyReport.sales_by_seller && dailyReport.sales_by_seller.length > 0 && (
          <div className="report-section">
            <h4>Sales by Seller</h4>
            <div className="sellers-list">
              {dailyReport.sales_by_seller.map((seller, index) => (
                <div key={index} className="seller-item">
                  <span className="seller-name">{seller.seller__username}</span>
                  <span className="seller-stats">
                    Sales: {formatCurrency(seller.total_sales)} | Profit: {formatCurrency(seller.total_profit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWeeklyReport = () => {
    if (!weeklyReport) return <div className="no-data">No weekly report data available</div>;
    
    return (
      <div className="report-content">
        <div className="report-header">
          <h3>Weekly Report</h3>
          <button onClick={() => loadReport('weekly', loadWeeklyReport)} className="refresh-button">
            Refresh
          </button>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Weekly Sales</h4>
            <p className="metric-value">{formatCurrency(weeklyReport.week_sales?.total_sales)}</p>
            <p className="metric-label">Total Revenue</p>
          </div>
          <div className="metric-card">
            <h4>Weekly Profit</h4>
            <p className="metric-value profit">{formatCurrency(weeklyReport.week_sales?.total_profit)}</p>
            <p className="metric-label">Net Profit</p>
          </div>
          <div className="metric-card">
            <h4>Transactions</h4>
            <p className="metric-value">{weeklyReport.week_sales?.transaction_count || 0}</p>
            <p className="metric-label">Total Orders</p>
          </div>
          <div className="metric-card">
            <h4>Growth</h4>
            <p className={`metric-value ${weeklyReport.sales_growth > 0 ? 'positive' : 'negative'}`}>
              {formatPercent(weeklyReport.sales_growth)}
            </p>
            <p className="metric-label">vs Last Week</p>
          </div>
        </div>

        {weeklyReport.daily_breakdown && weeklyReport.daily_breakdown.length > 0 && (
          <div className="report-section">
            <h4>Daily Breakdown</h4>
            <div className="breakdown-list">
              {weeklyReport.daily_breakdown.map((day, index) => (
                <div key={index} className="breakdown-item">
                  <span className="breakdown-date">{new Date(day.day).toLocaleDateString()}</span>
                  <span className="breakdown-stats">
                    Sales: {formatCurrency(day.total_sales)} | Profit: {formatCurrency(day.total_profit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="error-message">
          <h4>Error Loading Report</h4>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="refresh-button">
            Try Again
          </button>
        </div>
      );
    }

    if (loading) return <div className="loading">Loading report...</div>;
    
    switch (activeReport) {
      case 'daily':
        return renderDailyReport();
      case 'weekly':
        return renderWeeklyReport();
      case 'monthly':
        return <div className="no-data">Monthly report coming soon...</div>;
      case 'comprehensive':
        return <div className="no-data">Comprehensive report coming soon...</div>;
      default:
        return renderDailyReport();
    }
  };

  return (
    <div className="reports-dashboard">
      <div className="reports-header">
        <h3>Business Reports & Analytics</h3>
        <p>Comprehensive business intelligence and performance metrics</p>
      </div>

      <div className="reports-navigation">
        <button
          className={`report-tab ${activeReport === 'daily' ? 'active' : ''}`}
          onClick={() => loadReport('daily', loadDailyReport)}
        >
          Daily Report
        </button>
        <button
          className={`report-tab ${activeReport === 'weekly' ? 'active' : ''}`}
          onClick={() => loadReport('weekly', loadWeeklyReport)}
        >
          Weekly Report
        </button>
        <button
          className={`report-tab ${activeReport === 'monthly' ? 'active' : ''}`}
          onClick={() => loadReport('monthly', loadMonthlyReport)}
        >
          Monthly Report
        </button>
        <button
          className={`report-tab ${activeReport === 'comprehensive' ? 'active' : ''}`}
          onClick={() => loadReport('comprehensive', loadComprehensiveReport)}
        >
          Comprehensive
        </button>
      </div>

      <div className="reports-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsDashboard;