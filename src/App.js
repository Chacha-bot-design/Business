import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import StockAlert from './components/StockAlert';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'transactions':
        return <TransactionForm />;
      case 'reports':
        return <Reports />;
      case 'alerts':
        return <StockAlert />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Business Record Management System</h1>
        <nav className="nav-tabs">
          {['dashboard', 'products', 'transactions', 'reports', 'alerts'].map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>
      
      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;