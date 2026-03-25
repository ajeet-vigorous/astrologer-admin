import React from 'react';

const StatusBadge = ({ active }) => (
  <span style={{
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
    background: active ? '#d1fae5' : '#fee2e2', color: active ? '#065f46' : '#991b1b'
  }}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

export default StatusBadge;
