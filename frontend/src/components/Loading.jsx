import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
};

export default Loading;
