import React from 'react';
import { useAuth } from '../context/AuthContext';
import SellerDashboard from './SellerDashboard';
import ManagerDashboard from './ManagerDashboard';
import BossDashboard from './BossDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth(); // Added logout here
  
  const renderDashboard = () => {
    switch(user.role) {
      case 'SELLER':
        return <SellerDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'BOSS':
        return <BossDashboard />;
      default:
        return <div>Unauthorized</div>;
    }
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Business Management System</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, <strong>{user.username}</strong> ({user.role})</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;