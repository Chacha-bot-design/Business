import React from 'react';

const DebugInfo = () => {
  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '15px', 
      margin: '10px', 
      borderRadius: '5px',
      border: '1px solid #dee2e6',
      fontSize: '14px'
    }}>
      <h4>🔧 Frontend Debug Info</h4>
      <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || 'NOT SET'}</p>
      <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
      <p><strong>Backend Status:</strong> 
        <a 
          href={`${process.env.REACT_APP_API_URL}/health/`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ marginLeft: '10px' }}
        >
          Test Backend Connection
        </a>
      </p>
    </div>
  );
};

export default DebugInfo;