import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

const Dashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      console.log('🔄 Fetching reports...');
      setLoading(true);
      setError(null);
      
      const response = await reportsAPI.generateAll();
      console.log('✅ Reports data:', response.data);
      
      setReportData(response.data);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div>Loading dashboard data...</div>
        <div style={{fontSize: '0.9rem', color: '#666', marginTop: '10px'}}>
          This may take a few seconds
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Unable to Load Dashboard</h3>
        <p>Error: {error}</p>
        <div style={{margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '5px'}}>
          <strong>Possible solutions:</strong>
          <ul style={{textAlign: 'left', margin: '0.5rem 0'}}>
            <li>Make sure Django server is running on port 8000</li>
            <li>Check if the API endpoint exists</li>
            <li>Verify CORS is configured properly</li>
          </ul>
        </div>
        <button className="btn-retry" onClick={fetchReports}>
          Try Again
        </button>
      </div>
    );
  }

  // If reportData is empty or null
  if (!reportData) {
    return (
      <div className="error-container">
        <h3>No Data Available</h3>
        <p>Reports API returned empty data.</p>
        <button className="btn-retry" onClick={fetchReports}>
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="section-header">
        <h2>Business Overview</h2>
        <button className="btn-refresh" onClick={fetchReports}>
          Refresh Data
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Sales</h3>
          <p className="stat-value">Tsh{reportData?.daily?.sales?.toFixed(2) || '0.00'}</p>
          <small>Date: {reportData?.daily?.date || 'N/A'}</small>
        </div>
        
        <div className="stat-card">
          <h3>Today's Profit/Loss</h3>
          <p className={`stat-value ${(reportData?.daily?.profit_loss || 0) >= 0 ? 'profit' : 'loss'}`}>
            Tsh{reportData?.daily?.profit_loss?.toFixed(2) || '0.00'}
          </p>
          <small>Transactions: {reportData?.daily?.transactions || 0}</small>
        </div>
        
        <div className="stat-card">
          <h3>Weekly Sales</h3>
          <p className="stat-value">Tsh{reportData?.weekly?.sales?.toFixed(2) || '0.00'}</p>
          <small>Period: {reportData?.weekly?.period || 'N/A'}</small>
        </div>
        
        <div className="stat-card">
          <h3>Weekly Profit</h3>
          <p className={`stat-value ${(reportData?.weekly?.profit_loss || 0) >= 0 ? 'profit' : 'loss'}`}>
            Tsh{reportData?.weekly?.profit_loss?.toFixed(2) || '0.00'}
          </p>
          <small>Transactions: {reportData?.weekly?.transactions || 0}</small>
        </div>

        <div className="stat-card">
          <h3>Monthly Sales</h3>
          <p className="stat-value">Tsh{reportData?.monthly?.sales?.toFixed(2) || '0.00'}</p>
          <small>Period: {reportData?.monthly?.period || 'N/A'}</small>
        </div>

        <div className="stat-card">
          <h3>Monthly Profit</h3>
          <p className={`stat-value ${(reportData?.monthly?.profit_loss || 0) >= 0 ? 'profit' : 'loss'}`}>
            Tsh{reportData?.monthly?.profit_loss?.toFixed(2) || '0.00'}
          </p>
          <small>Transactions: {reportData?.monthly?.transactions || 0}</small>
        </div>
      </div>

      <div className="detailed-reports">
        <div className="report-section">
          <h3>Daily Report - {reportData?.daily?.date || 'Today'}</h3>
          <div className="report-details">
            <p><strong>Sales:</strong> Tsh{reportData?.daily?.sales?.toFixed(2) || '0.00'}</p>
            <p><strong>Purchases:</strong> Tsh{reportData?.daily?.purchases?.toFixed(2) || '0.00'}</p>
            <p><strong>Transactions:</strong> {reportData?.daily?.transactions || 0}</p>
            <p><strong>Profit/Loss:</strong> 
              <span className={reportData?.daily?.profit_loss >= 0 ? 'profit' : 'loss'}>
                Tsh{reportData?.daily?.profit_loss?.toFixed(2) || '0.00'}
              </span>
            </p>
          </div>
        </div>

        <div className="report-section">
          <h3>Weekly Report - {reportData?.weekly?.period || 'This Week'}</h3>
          <div className="report-details">
            <p><strong>Sales:</strong> Tsh{reportData?.weekly?.sales?.toFixed(2) || '0.00'}</p>
            <p><strong>Purchases:</strong> Tsh{reportData?.weekly?.purchases?.toFixed(2) || '0.00'}</p>
            <p><strong>Transactions:</strong> {reportData?.weekly?.transactions || 0}</p>
            <p><strong>Profit/Loss:</strong> 
              <span className={reportData?.weekly?.profit_loss >= 0 ? 'profit' : 'loss'}>
                Tsh{reportData?.weekly?.profit_loss?.toFixed(2) || '0.00'}
              </span>
            </p>
          </div>
        </div>

        <div className="report-section">
          <h3>Monthly Report - {reportData?.monthly?.period || 'This Month'}</h3>
          <div className="report-details">
            <p><strong>Sales:</strong> Tsh{reportData?.monthly?.sales?.toFixed(2) || '0.00'}</p>
            <p><strong>Purchases:</strong> Tsh{reportData?.monthly?.purchases?.toFixed(2) || '0.00'}</p>
            <p><strong>Transactions:</strong> {reportData?.monthly?.transactions || 0}</p>
            <p><strong>Profit/Loss:</strong> 
              <span className={reportData?.monthly?.profit_loss >= 0 ? 'profit' : 'loss'}>
                Tsh{reportData?.monthly?.profit_loss?.toFixed(2) || '0.00'}
              </span>
            </p>
          </div>
        </div>

        <div className="report-section">
          <h3>Yearly Report - {reportData?.yearly?.year || 'This Year'}</h3>
          <div className="report-details">
            <p><strong>Sales:</strong> Tsh{reportData?.yearly?.sales?.toFixed(2) || '0.00'}</p>
            <p><strong>Purchases:</strong> Tsh{reportData?.yearly?.purchases?.toFixed(2) || '0.00'}</p>
            <p><strong>Transactions:</strong> {reportData?.yearly?.transactions || 0}</p>
            <p><strong>Profit/Loss:</strong> 
              <span className={reportData?.yearly?.profit_loss >= 0 ? 'profit' : 'loss'}>
                Tsh{reportData?.yearly?.profit_loss?.toFixed(2) || '0.00'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;