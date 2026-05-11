// HistoryChart.js - الملف المحدث
import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getDailyCounts } from "../api";
import "./HistoryChart.css";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function HistoryChart({ cameraId }) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    if (!data || data.length === 0)
      return {
        totalPeople: 0,
        totalDays: 0,
        dailyAverage: 0,
        maxCount: 0,
        minCount: 0,
      };

    const totalPeople = data.reduce((sum, item) => sum + item.total, 0);
    const totalDays = data.length;
    const dailyAverage = totalPeople / totalDays;
    const maxCount = Math.max(...data.map((item) => item.total));
    const minCount = Math.min(...data.map((item) => item.total));

    return {
      totalPeople,
      totalDays,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      maxCount,
      minCount,
    };
  }, [data]);

  // Fetch daily count data from the API
  const fetchData = async () => {
    if (!cameraId) return setData([]);

    setLoading(true);
    setError(null);
    try {
      const response = await getDailyCounts(cameraId);
      
      // التأكد من أن البيانات موجودة
      if (response.data && Array.isArray(response.data)) {
        const formatted = response.data.map((item) => ({
          day: item.day,
          displayDate: new Date(item.day).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          total: item.total,
          date: new Date(item.day),
        }));

        // Sort data by date
        formatted.sort((a, b) => a.date - b.date);
        setData(formatted);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching daily counts:", err);
      let message = "فشل في تحميل البيانات.";
      if (err.code === "ERR_NETWORK") message = "لا يمكن الاتصال بالخادم.";
      else if (err.response?.status === 404) message = "الكاميرا غير موجودة.";
      else if (err.response?.status >= 500) message = "خطأ في الخادم الداخلي.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cameraId, retryCount]);

  const handleRetry = () => setRetryCount((prev) => prev + 1);

  const formatNumber = (num) => new Intl.NumberFormat("ar-EG").format(num);

  if (loading) return (
    <div className="chart-loading">
      <div className="loading-spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>
  );

  if (error)
    return (
      <div className="chart-error">
        <div className="error-message">{error}</div>
        <button onClick={handleRetry} className="retry-btn">
          إعادة المحاولة
        </button>
      </div>
    );

  const chartData = {
    labels: data.map((d) => d.displayDate),
    datasets: [
      {
        label: "عدد الأشخاص اليومي",
        data: data.map((d) => d.total),
        borderColor: theme.palette.chartLegacy.blue,
        backgroundColor: alpha(theme.palette.chartLegacy.blue, 0.2),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: theme.palette.chartLegacy.blue,
        pointHoverBackgroundColor: theme.palette.chartLegacy.dangerAccent,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { 
          font: { 
            family: "Tajawal, sans-serif", 
            size: 13 
          } 
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${formatNumber(ctx.raw)} شخص`,
        },
      },
    },
    scales: {
      x: { 
        ticks: { 
          font: { 
            size: 12,
            family: "Tajawal, sans-serif"
          } 
        } 
      },
      y: {
        ticks: {
          font: { 
            size: 12,
            family: "Tajawal, sans-serif"
          },
          callback: (val) => formatNumber(val),
        },
      },
    },
  };

  return (
    <div className="history-chart" dir="rtl">
      <div className="chart-header">
        <h3>رسم بياني لعدد الأشخاص (الكاميرا {cameraId})</h3>
        <div className="chart-stats-summary">
          <div className="stat-item">
            <span className="stat-label">المجموع:</span>
            <span className="stat-value">{formatNumber(statistics.totalPeople)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">المتوسط اليومي:</span>
            <span className="stat-value">{formatNumber(statistics.dailyAverage)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">أعلى عدد:</span>
            <span className="stat-value">{formatNumber(statistics.maxCount)}</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="no-data">
          لا توجد بيانات متاحة للكاميرا {cameraId}.
        </div>
      ) : (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}