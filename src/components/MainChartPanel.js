// src/components/MainChartPanel.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box ,useTheme} from '@mui/material';
import Last24hChart from './Last24hChart';
import DomainChart from './DomainChart';



const MainChartPanel = ({ dateMode, responseData, startDate, endDate, trendData }) => {
const theme = useTheme();

return (
  
  <Paper sx={{p:1, height: '98%', display: 'flex', flexDirection: 'column', backgroundColor:theme.palette.background.default ,boxShadow:'none'}}>
    {dateMode === 'single' && responseData?.type === 'raw' && (
      <Last24hChart rawData={responseData.data} startDate={startDate} />
    )}

    {dateMode === 'range' && responseData?.type === 'summary' && (
      <Box height="100%" display="flex" flexDirection="column">
        <Typography variant="h6" gutterBottom color="primary">
          📅 Daily Customer Trend
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={2}>
          This bar chart shows the total number of customers for each day within the selected date range.
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
    )}

    {dateMode === 'domain' && responseData?.type === 'raw' && (
      <DomainChart rawData={responseData.data} />
    )}
    
    {!responseData && (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="body1" color="textSecondary">Select criteria and click Analyze</Typography>
      </Box>
    )}
  </Paper>
)};

export default MainChartPanel;