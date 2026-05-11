// MonthlyStatsChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getMonthlyStats } from '../api'; // سننشئ هذا الدالة في api.js

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MonthlyStatsChart() {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMonthlyStats();
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

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Total Customers',
        data: data.map(item => item.total_customers),
        borderColor: theme.palette.chartLegacy.blue,
        backgroundColor: alpha(theme.palette.chartLegacy.blue, 0.2),
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Male %',
        data: data.map(item => item.male_percentage),
        borderColor: theme.palette.chartLegacy.green,
        backgroundColor: alpha(theme.palette.chartLegacy.green, 0.2),
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Female %',
        data: data.map(item => item.female_percentage),
        borderColor: theme.palette.chartLegacy.red,
        backgroundColor: alpha(theme.palette.chartLegacy.red, 0.2),
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Adult %',
        data: data.map(item => item.adult_percentage),
        borderColor: theme.palette.chartLegacy.yellow,
        backgroundColor: alpha(theme.palette.chartLegacy.yellow, 0.2),
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Child %',
        data: data.map(item => item.child_percentage),
        borderColor: theme.palette.chartLegacy.teal,
        backgroundColor: alpha(theme.palette.chartLegacy.teal, 0.2),
        fill: false,
        tension: 0.4,
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
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div>
      <h3>Monthly Customer Stats</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}