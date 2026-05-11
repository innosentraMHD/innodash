import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const formatHourShort = (hour) => {
  const date = new Date(); 
  date.setHours(hour);
  let h = date.getHours(); 
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12; 
  return `${h} ${ampm}`;
};

const formatHourRange = (hour) => {
  const fmt = (h) => { 
    const a = h >= 12 ? 'PM' : 'AM'; 
    const d = h % 12 || 12; 
    return `${d}:00 ${a}`; 
  };
  return `${fmt(hour)} - ${fmt((hour + 1) % 24)}`;
};

export default function Last24hChart({ rawData, startDate }) {
  const theme = useTheme(); // استخدام الثيم للوصول للألوان والوضع الحالي

  const processedHourlyData = useMemo(() => {
    const counts = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
    let total = 0;
    
    if (!rawData) return counts;

    rawData.forEach((rec) => {
      try {
        const h = new Date(rec.timestamp).getHours();
        const c = rec.totalcount || 0;
        if (counts[h]) counts[h].count += c;
        total += c;
      } catch (e) {}
    });
    
    return counts.map(i => ({ 
      hour: i.hour, 
      count: i.count,
      percentage: total > 0 ? (i.count / total) * 100 : 0 
    }));
  }, [rawData]);

  const chartData = useMemo(() => ({
    labels: processedHourlyData.map(i => formatHourShort(i.hour)),
    datasets: [{
      label: 'Number of Customers',
      data: processedHourlyData.map(i => i.count),
      // تغيير ألوان الأعمدة حسب الوضع
      backgroundColor: theme.palette.mode === 'light' 
        ? alpha(theme.palette.primary.main, 0.5)   // فيروزي شفاف للنهار
        : alpha(theme.palette.custom.last24, 0.5), // أبيض شفاف لليل
      borderColor: theme.palette.mode === 'light' 
        ? alpha(theme.palette.primary.main, 1)     // فيروزي غامق للنهار
        : theme.palette.custom.last24,                 // أبيض لليل
      borderWidth: 1,
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    }],
  }), [processedHourlyData, theme.palette.mode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
            color: theme.palette.text.primary // لون نص المفتاح
        }
      },
      tooltip: {
        // تخصيص التلميح ليناسب الوضع (Chart.js يدير الخلفية تلقائياً لكن يمكن تخصيصها)
        backgroundColor: theme.palette.background.default,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        callbacks: {
          title: (items) => formatHourRange(processedHourlyData[items[0].dataIndex].hour),
          label: (ctx) => {
            const data = processedHourlyData[ctx.dataIndex];
            return [`Customers: ${data.count}`, `Percentage: ${data.percentage.toFixed(1)}%`];
          }
        }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        ticks: {
          color:theme.palette.text.secondary, // لون الأرقام على المحور
          callback: function(value) {
            return value;
          }
        },
        grid: {
            color: theme.palette.divider, // لون خطوط الشبكة
        },
        title: {
          display: true,
          text: 'Number of Customers',
          color: theme.palette.text.secondary // لون عنوان المحور
        }
      },
      x: {
        ticks: {
            color: theme.palette.text.secondary
        },
        grid: {
            color: theme.palette.divider, // قد تخفي خطوط الشبكة العمودية بجعلها شفافة إذا أردت
            display: false // إخفاء الشبكة العمودية لتصميم أنظف
        },
        title: {
          display: true,
          text: 'Hours',
          color: theme.palette.text.secondary
        }
      }
    }
  };

  return (
    <Box height="100%"  display="flex" flexDirection="column" sx={{p:0 ,m:0,width:{xs:"100%",md:"75%"} }}>
      <Typography variant="h6" gutterBottom color="primary">
       Hourly Customer Distribution ({startDate})
      </Typography>
     
      <Box flexGrow={1} minHeight={400} >
        <Bar  data={chartData} options={options} />
      </Box>
    </Box>
  );
}