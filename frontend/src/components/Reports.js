import React, { useState, useEffect } from 'react';
import { reportsAPI, transactionAPI } from '../services/api';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    fetchRecentTransactions();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.generate();
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Simple CSV export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Type,Product,Quantity,Amount\n"
      + transactions.map(transaction => 
          `${new Date(transaction.transaction_date).toLocaleDateString()},${transaction.transaction_type},${transaction.product_name},${transaction.quantity},${transaction.total_amount}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "business_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>Business Reports</h2>
        <button className="btn-primary" onClick={exportToCSV}>
          Export to CSV
        </button>
      </div>

      {reportData && (
        <div className="reports-summary">
          <div className="report-card">
            <h3>Daily Summary</h3>
            <div className="report-details">
              <p><strong>Sales:</strong> ${reportData.daily?.sales?.toFixed(2)}</p>
              <p><strong>Purchases:</strong> ${reportData.daily?.purchases?.toFixed(2)}</p>
              <p><strong>Transactions:</strong> {reportData.daily?.transactions}</p>
              <p><strong>Profit/Loss:</strong> 
                <span className={reportData.daily?.profit_loss >= 0 ? 'profit' : 'loss'}>
                  ${reportData.daily?.profit_loss?.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          <div className="report-card">
            <h3>Weekly Summary</h3>
            <div className="report-details">
              <p><strong>Sales:</strong> ${reportData.weekly?.sales?.toFixed(2)}</p>
              <p><strong>Purchases:</strong> ${reportData.weekly?.purchases?.toFixed(2)}</p>
              <p><strong>Transactions:</strong> {reportData.weekly?.transactions}</p>
              <p><strong>Profit/Loss:</strong> 
                <span className={reportData.weekly?.profit_loss >= 0 ? 'profit' : 'loss'}>
                  ${reportData.weekly?.profit_loss?.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          <div className="report-card">
            <h3>Monthly Summary</h3>
            <div className="report-details">
              <p><strong>Sales:</strong> ${reportData.monthly?.sales?.toFixed(2)}</p>
              <p><strong>Purchases:</strong> ${reportData.monthly?.purchases?.toFixed(2)}</p>
              <p><strong>Transactions:</strong> {reportData.monthly?.transactions}</p>
              <p><strong>Profit/Loss:</strong> 
                <span className={reportData.monthly?.profit_loss >= 0 ? 'profit' : 'loss'}>
                  ${reportData.monthly?.profit_loss?.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="transactions-list">
        <h3>Recent Transactions</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map(transaction => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`transaction-type ${transaction.transaction_type.toLowerCase()}`}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td>{transaction.product_name}</td>
                  <td>{transaction.quantity}</td>
                  <td>${transaction.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;