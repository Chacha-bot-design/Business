import React, { useState } from 'react';
import UserManagement from './UserManagement';
import ProfitDashboard from './ProfitDashboard';
import ReportsDashboard from './ReportsDashboard';
import './BossDashboard.css';

const BossDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Financial Overview', icon: '📊' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'reports', name: 'Reports & Analytics', icon: '📈' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfitDashboard />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <ReportsDashboard />;
      default:
        return <ProfitDashboard />;
    }
  };

  return (
    <div className="boss-dashboard">
      <div className="boss-header">
        <h2>Administration Panel</h2>
        <p className="boss-subtitle">Complete system control and monitoring</p>
      </div>

      <div className="tabs-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default BossDashboard;