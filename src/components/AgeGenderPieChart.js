// AgeGenderPieChart.js
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@mui/material';
import { getAgeGenderStats } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AgeGenderPieChart() {
  const theme = useTheme();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAgeGenderStats();
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

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [data.male_percentage, data.female_percentage],
        backgroundColor: [theme.palette.chartLegacy.sky, theme.palette.chartLegacy.pink],
        hoverBackgroundColor: [theme.palette.chartLegacy.sky, theme.palette.chartLegacy.pink],
      },
    ],
  };

  const ageData = {
    labels: ['Adults', 'Children'],
    datasets: [
      {
        data: [data.adult_percentage, data.child_percentage],
        backgroundColor: [theme.palette.chartLegacy.amber, theme.palette.chartLegacy.cyan],
        hoverBackgroundColor: [theme.palette.chartLegacy.amber, theme.palette.chartLegacy.cyan],
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
      <h3>Age and Gender Distribution</h3>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: '45%' }}>
          <h4>Gender</h4>
          <Pie data={genderData} options={options} />
        </div>
        <div style={{ width: '45%' }}>
          <h4>Age</h4>
          <Pie data={ageData} options={options} />
        </div>
      </div>
    </div>
  );
}