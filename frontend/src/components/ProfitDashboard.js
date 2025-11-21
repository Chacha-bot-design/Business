import React, { useState, useEffect } from 'react';
import { productsAPI, reportsAPI, salesAPI } from '../services/api';
import './ProfitDashboard.css';

const ProfitDashboard = () => {
  const [products, setProducts] = useState([]);
  const [profitReport, setProfitReport] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, reportRes, salesRes] = await Promise.all([
        productsAPI.getAll(),
        reportsAPI.profitLossReport(),
        salesAPI.getAll()
      ]);
      
      setProducts(productsRes.data);
      setProfitReport(reportRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalProfit = sales.reduce((sum, sale) => sum + parseFloat(sale.profit || 0), 0);
  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

  return (
    <div className="profit-dashboard">
      <div className="dashboard-header">
        <h3>Financial Overview</h3>
        <button className="refresh-button" onClick={loadData}>
          Refresh Data
        </button>
      </div>
      
      <div className="financial-summary">
        <div className="summary-grid">
          <div className="summary-card revenue">
            <div className="card-content">
              <h4>Total Revenue</h4>
              <p className="summary-value">${totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="summary-card profit">
            <div className="card-content">
              <h4>Total Profit</h4>
              <p className="summary-value">${totalProfit.toLocaleString()}</p>
            </div>
          </div>
          <div className="summary-card margin">
            <div className="card-content">
              <h4>Profit Margin</h4>
              <p className="summary-value">
                {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {profitReport && (
        <div className="profit-section">
          <h4>Detailed Profit & Loss Report</h4>
          <div className="report-grid">
            <div className="report-card">
              <div className="report-header">
                <h5>Daily</h5>
              </div>
              <div className="report-body">
                <p><strong>Sales:</strong> ${profitReport.daily.total_sales || 0}</p>
                <p><strong>Profit:</strong> ${profitReport.daily.total_profit || 0}</p>
                <p><strong>Transactions:</strong> {profitReport.daily.transaction_count || 0}</p>
              </div>
            </div>
            <div className="report-card">
              <div className="report-header">
                <h5>Weekly</h5>
              </div>
              <div className="report-body">
                <p><strong>Sales:</strong> ${profitReport.weekly.total_sales || 0}</p>
                <p><strong>Profit:</strong> ${profitReport.weekly.total_profit || 0}</p>
                <p><strong>Transactions:</strong> {profitReport.weekly.transaction_count || 0}</p>
              </div>
            </div>
            <div className="report-card">
              <div className="report-header">
                <h5>Monthly</h5>
              </div>
              <div className="report-body">
                <p><strong>Sales:</strong> ${profitReport.monthly.total_sales || 0}</p>
                <p><strong>Profit:</strong> ${profitReport.monthly.total_profit || 0}</p>
                <p><strong>Transactions:</strong> {profitReport.monthly.transaction_count || 0}</p>
              </div>
            </div>
            <div className="report-card">
              <div className="report-header">
                <h5>Yearly</h5>
              </div>
              <div className="report-body">
                <p><strong>Sales:</strong> ${profitReport.yearly.total_sales || 0}</p>
                <p><strong>Profit:</strong> ${profitReport.yearly.total_profit || 0}</p>
                <p><strong>Transactions:</strong> {profitReport.yearly.transaction_count || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="products-section">
        <h4>Product Profit Analysis</h4>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Profit Margin</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>
                    <td className="cost-price">${product.cost_price}</td>
                    <td className="selling-price">${product.price}</td>
                    <td className={`profit-margin ${product.profit_margin > 0 ? 'positive' : 'negative'}`}>
                      ${product.profit_margin} ({(product.profit_margin / product.cost_price * 100).toFixed(1)}%)
                    </td>
                    <td className="stock-quantity">{product.stock_quantity}</td>
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

      <div className="sales-section">
        <h4>Sales with Profit Breakdown</h4>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Seller</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Profit</th>
                <th>Margin</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 15).map(sale => (
                <tr key={sale.id}>
                  <td className="sale-id">#{sale.id}</td>
                  <td className="seller-name">{sale.seller_name}</td>
                  <td className="sale-date">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  <td className="sale-amount">${sale.total_amount}</td>
                  <td className={`sale-profit ${sale.profit > 0 ? 'positive' : 'negative'}`}>
                    ${sale.profit}
                  </td>
                  <td className="profit-margin">
                    {((sale.profit / sale.total_amount) * 100).toFixed(1)}%
                  </td>
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

export default ProfitDashboard;