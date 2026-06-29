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
      } catch (e) { }
    });

    return counts.map(i => ({
      hour: i.hour,
      count: i.count,
      percentage: total > 0 ? (i.count / total) * 100 : 0
    }));
  }, [rawData]);

  // const processedHourlyData = useMemo(() => {
  //   const counts = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0, percentage: 0 }));
  //   let total = 0;

  //   if (!rawData) return counts;

  //   // 1. حساب العدد الكلي الصحيح أولاً
  //   rawData.forEach((rec) => {
  //     try {
  //       total += rec.totalcount || 0;
  //     } catch (e) { }
  //   });

  //   if (total === 0) return counts;

  //   // 👇 --- التوزيع العشوائي الذكي للمعرض --- 👇

  //   // الساعات المسموح بها (من 8 صباحاً إلى 10 مساءً)
  //   // الساعات المستثناة ستظل صفر (23, 0, 1, 2, 3, 4, 5, 6, 7)
  //   const activeHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    
  //   // توليد أوزان عشوائية للساعات النشطة لتبدو البيانات طبيعية
  //   const weights = activeHours.map(() => Math.random());
  //   const weightSum = weights.reduce((a, b) => a + b, 0);

  //   let distributed = 0;

  //   activeHours.forEach((hour, index) => {
  //     if (index === activeHours.length - 1) {
  //       // إعطاء الباقي للساعة الأخيرة لضمان أن المجموع يتطابق 100% مع العدد الكلي
  //       counts[hour].count = total - distributed;
  //     } else {
  //       // توزيع العدد بناءً على الوزن العشوائي
  //       const amount = Math.floor((weights[index] / weightSum) * total);
  //       counts[hour].count = amount;
  //       distributed += amount;
  //     }
  //   });

  //   // 👆 --- نهاية التعديل --- 👆

  //   // حساب النسب المئوية النهائية
  //   return counts.map(i => ({
  //     ...i,
  //     percentage: total > 0 ? (i.count / total) * 100 : 0
  //   }));
  // }, [rawData]);

  const chartData = useMemo(() => ({
    labels: processedHourlyData.map(i => formatHourShort(i.hour)),
    datasets: [{
      label: 'Number of Customers',
      data: processedHourlyData.map(i => i.count),
      // تغيير ألوان الأعمدة حسب الوضع
      backgroundColor: alpha('#0A3C5A', 0.85),
      borderColor: '#0A3C5A',
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
          color: theme.palette.text.secondary, // لون الأرقام على المحور
          callback: function (value) {
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
    <Box height="100%" display="flex" flexDirection="column" sx={{ px: 4, m: 0, width: "100%" }}>
      <Typography variant="h6" gutterBottom color="primary">
        Hourly Customer Distribution ({startDate})
      </Typography>

      <Box flexGrow={1} minHeight={400} >
        <Bar data={chartData} options={options} sx={{ height: "100%", width: "100%" }} />
      </Box>
    </Box>


  );

}