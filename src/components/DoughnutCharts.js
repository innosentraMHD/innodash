import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Box, Paper, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';

// --- 1. استيراد العناصر الضرورية من chart.js ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// --- 2. تسجيل العناصر ---
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutCharts = ({ processedStats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: theme.palette.text.primary // لون النص يتغير حسب الوضع
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${pct}%`;
          },
        },
        // تحسين مظهر التلميح ليناسب الثيم
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
    maintainAspectRatio: false,
  };

  const createData = (labels, data, colors) => ({
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderWidth: 2,
      borderColor: theme.palette.background.paper // لون الحدود يطابق خلفية الورقة
    }],
  });

  // استخدام الألوان من الثيم
  const charts = [
    {
      title: 'Gender',
      data: createData(
        ['Male', 'Female'],
        [processedStats.totalMale, processedStats.totalFemale],
        ['#0A3C5A', '#00a97cff']
      )
    },
    {
      title: 'Age',
      data: createData(
        ['Adult', 'Child'],
        [processedStats.totalAdult, processedStats.totalChild],
        ['#0A3C5A', '#00a97cff']
      )
    },
    // { 
    //   title: 'Residency', 
    //   data: createData(
    //     ['Local', 'Non-Local'], 
    //     [processedStats.totalLocal, processedStats.totalNonLocal], 
    //     [theme.palette.charts.local, theme.palette.charts.nonLocal]
    //   ) 
    // },
  ];

  return (
    <Box sx={{ p: 1, pt: 0, pb: 0 }}>
      <Grid
        container
        spacing={2}
        alignItems="stretch"
        justifyContent="center"
      >
        {charts.map((chart, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper elevation={0}
              sx={{
                p: 0.5,
                height: "100%",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {chart.title} Distribution
              </Typography>
              <Box
                sx={{
                  pb: 2,
                  flexGrow: 1,
                  position: 'relative',
                  width: "100%",
                  maxWidth: 160,
                  height: 160
                }}
              >
                <Doughnut data={chart.data} options={options} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DoughnutCharts;