import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DomainChart({ rawData }) {
  const theme = useTheme();
  const processedDomainData = useMemo(() => {
    const domainData = {};
    let total = 0;

    if (!rawData) return [];

    rawData.forEach((rec) => {
      try {
        const domain = rec.domain;
        const count = (rec.male_adult || 0) + (rec.female_adult || 0) + (rec.male_child || 0) + (rec.female_child || 0);
        
        if (domainData[domain]) {
          domainData[domain] += count;
        } else {
          domainData[domain] = count;
        }
        total += count;
      } catch (e) {}
    });

    // تحويل إلى مصفوفة وحساب النسب المئوية
    return Object.keys(domainData)
      .sort()
      .map(domain => ({
        domain,
        count: domainData[domain],
        percentage: total > 0 ? (domainData[domain] / total) * 100 : 0
      }));
  }, [rawData]);

  const chartData = useMemo(() => ({
    labels: processedDomainData.map(i => i.domain),
    datasets: [{
      label: 'Percentage of Customers',
      data: processedDomainData.map(i => i.percentage),
      backgroundColor: alpha(theme.palette.chartLegacy.pink, 0.5),
      borderColor: alpha(theme.palette.chartLegacy.pink, 1),
      borderWidth: 1,
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    }],
  }), [processedDomainData, theme.palette.chartLegacy.pink]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw?.toFixed(1)}% (Total: ${processedDomainData[ctx.dataIndex].count})`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Typography variant="h6" color="primary" gutterBottom>
        Domain Distribution
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Displays customer traffic percentage per domain.
      </Typography>
      <Box flexGrow={1} minHeight={400}>
        <Bar data={chartData} options={options} />
      </Box>
    </Box>
  );
}