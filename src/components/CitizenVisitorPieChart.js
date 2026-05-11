// CitizenVisitorPieChart.js
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@mui/material';
import { getCitizenVisitorStats } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CitizenVisitorPieChart() {
  const theme = useTheme();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCitizenVisitorStats();
        setData(response.data);
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

  const pieData = {
    labels: ['Citizens', 'Visitors'],
    datasets: [
      {
        data: [data.locals_percentage, data.non_locals_percentage],
        backgroundColor: [theme.palette.chartLegacy.sky, theme.palette.chartLegacy.pink],
        hoverBackgroundColor: [theme.palette.chartLegacy.sky, theme.palette.chartLegacy.pink],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div>
      <h3>Citizens vs Visitors</h3>
      <Pie data={pieData} options={options} />
    </div>
  );
}