// StaffCountCard.js
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { getStaffCount } from '../api';

export default function StaffCountCard() {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStaffCount();
        setCount(response.data.total_staff);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Current Staff Count</h3>
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: theme.palette.chartLegacy.blue }}>
        {count}
      </div>
      <p>Active staff members</p>
    </div>
  );
}