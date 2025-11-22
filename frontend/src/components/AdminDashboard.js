// components/AdminDashboard.js
import React, { useState } from 'react';
import ProductManagement from './ProductManagement';
import SalesManagement from './SalesManagement';
import ProfitLossManagement from './ProfitLossManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Manage Products
        </button>
        <button 
          className={activeTab === 'sales' ? 'active' : ''}
          onClick={() => setActiveTab('sales')}
        >
          Manage Sales
        </button>
        <button 
          className={activeTab === 'profitloss' ? 'active' : ''}
          onClick={() => setActiveTab('profitloss')}
        >
          Profit/Loss Reports
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'sales' && <SalesManagement />}
        {activeTab === 'profitloss' && <ProfitLossManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;