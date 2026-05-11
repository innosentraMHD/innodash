// DayChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

export default function DayChart({ trendData, startDate, endDate }) {
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Typography variant="h6" color="primary" gutterBottom>
        Daily Distribution ({startDate} to {endDate})
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Displays customer traffic per day in the selected range.
      </Typography>
      <Box flexGrow={1} minHeight={400}>
        <Bar 
          data={trendData} 
          options={{ 
            maintainAspectRatio: false, 
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} 
        />
      </Box>
    </Box>
  );
}