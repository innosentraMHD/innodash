import React from 'react';

const StatCard = ({ IconComponent, value, label, color }) => (
  <div className="stat-card" style={{ color }}>
    <div className="icon"><IconComponent size={32} /></div>
    <div className="value">{value}</div>
    <div className="label">{label}</div>
  </div>
);

export default StatCard;
