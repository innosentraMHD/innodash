// src/components/Dashboard.js
import React, { useState, useMemo, useEffect } from 'react';
import axiosInstance, { API } from '../api';

import {
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
  Box,
  Typography,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import {
  Today,
  DateRange,
  Search,
  AutoGraph
} from '@mui/icons-material';

import MainChartPanel from './MainChartPanel';
import StatSummary from './StatSummary';
import { getTodayDate, getFirstDayOfMonth, getLastDayOfMonth, getDatesInRange } from '../utils';

const API_BASE_URL = API.DASHBOARD;
const STORES_API_URL = API.STORES;

// --- تعريف حركة الخلفية العصرية (Animated Background) ---
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- Dashboard Controls Component (Integrated) ---
const DashboardControls = ({
  tempStoreId, setTempStoreId, tempStartDate, setTempStartDate,
  tempEndDate, setTempEndDate, dateMode, handleDateModeToggle,
  handleAnalyzeClick, loading, storesList
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2 },
        mb: 2,
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        backdropFilter: 'blur(12px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.85),
        boxShadow: theme.palette.mode === 'light' ? `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.08)}` : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>

        <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: 0.5 }}>
          Analytics Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3} direction={isMobile ? "column" : "row"} alignItems="center" justifyContent="space-between">

        {/* القسم العلوي: المتجر + الزر + التواريخ */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3} direction={isMobile ? "column" : "row"} alignItems="center">

            {/* المتجر */}
            <Grid item xs={12} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel shrink={true}>Store</InputLabel>
                <Select
                  value={tempStoreId}
                  label="Store"
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                  renderValue={(selected) => {
                    if (!selected || selected === '') {
                      return <span style={{ color: theme.palette.text.secondary }}>All Stores</span>;
                    }
                    const selectedStore = storesList?.find(store => store.id === selected);
                    return selectedStore?.store_name || selected;
                  }}
                  onChange={(e) => setTempStoreId(e.target.value)}
                >
                  <MenuItem value=""><em>All Stores</em></MenuItem>
                  {Array.isArray(storesList) && storesList.map((store) => (
                    <MenuItem key={store.id} value={store.id} sx={{ whiteSpace: 'normal' }}>
                      {store.store_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* زر التبديل بين يوم وفترة */}
            <Grid item xs={12} md="auto">
              <Button
                variant={theme.palette.mode === 'light' ? "outlined" : "contained"}
                color="secondary"
                onClick={handleDateModeToggle}
                startIcon={dateMode === 'single' ? <DateRange /> : <Today />}
                size="medium"
                sx={{ borderRadius: 2, height: '40px', px: 3, boxShadow: 'none' }}
                fullWidth={isMobile}
              >
                {dateMode === 'single' ? 'Range' : 'Day'}
              </Button>
            </Grid>

            {/* التاريخ */}
            <Grid item xs={12} md={dateMode === 'range' ? 3 : 4}>
              <TextField
                fullWidth
                size="small"
                label={dateMode === 'single' ? "Date" : "Start Date"}
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {dateMode === 'range' && (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* زر Analyze */}
        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>


          <Button
            variant="contained"
            onClick={handleAnalyzeClick}
            disabled={loading}
            startIcon={<Search />}
            size="large"
            fullWidth={isMobile}
            disableElevation
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.85),
                boxShadow: `0 6px 16px 0 ${alpha(theme.palette.primary.contrastText, 0.3)}`,
                transform: 'translateY(-1px)' // لمسة تفاعلية بسيطة
              },
              '&.Mui-disabled': {              // ← إضافة هذا
                backgroundColor: theme.palette.grey[500],
                color: theme.palette.grey[300],
                opacity: 0.7,
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>



        </Grid>
      </Grid>
    </Paper>
  );
};

const Dashboard = ({ onGoToMachines, onGoToStatsReport, onGoToEmailSettings }) => {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storeId, setStoreId] = useState('');
  const [storesList, setStoresList] = useState([]);
  const [dateMode, setDateMode] = useState('single');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [tempStoreId, setTempStoreId] = useState('');
  const [tempStartDate, setTempStartDate] = useState(getTodayDate());
  const [tempEndDate, setTempEndDate] = useState(getTodayDate());
  const theme = useTheme();

  const fetchData = async (store, start, end) => {
    setLoading(true);
    setError(null);
    setResponseData(null);
    const params = new URLSearchParams();
    if (store) params.append('store_id', store);
    if (start) params.append('start', start);
    if (dateMode === 'range' && end) params.append('end', end);
    try {
      const res = await axiosInstance.get(API_BASE_URL, { params });
      setResponseData(res.data);
      console.log(responseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeClick = () => {
    const effectiveStart = tempStartDate || getFirstDayOfMonth();
    const effectiveEnd = tempEndDate || getLastDayOfMonth();
    setStartDate(effectiveStart);
    setEndDate(effectiveEnd);
    setStoreId(tempStoreId);
    fetchData(tempStoreId, effectiveStart, effectiveEnd);
  };

  const handleDateModeToggle = () => {
    if (dateMode === 'single') {
      setDateMode('range');
      setTempStartDate(getFirstDayOfMonth());
      setTempEndDate(getLastDayOfMonth());
    } else {
      setDateMode('single');
      setTempStartDate(getTodayDate());
      setTempEndDate(getTodayDate());
    }
  };

  // 1. جلب قائمة المتاجر
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axiosInstance.get(STORES_API_URL);
        let storesData = res.data;
        if (!Array.isArray(storesData)) {
          storesData = storesData.results || storesData.stores || storesData.data || [];
        }
        if (!Array.isArray(storesData)) {
          storesData = [];
        }
        setStoresList(storesData);
      } catch (err) {
        console.error("Error fetching stores:", err);
        setStoresList([]);
      }
    };
    fetchStores();
  }, []);

  // 2. سحب بيانات اليوم الحالي تلقائياً عند فتح الصفحة
  useEffect(() => {
    const today = getTodayDate();
    fetchData('', today, today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processedStats = useMemo(() => {

    // const empty = {
    //   totalMale: 0, totalFemale: 0, totalAdult: 0, totalChild: 0,
    //   totalLocal: 0, totalNonLocal: 0, totalCustomers: 0,
    //   avgTimePurchase: 0, avgTimeNotPurchase: 0, avgTimeCashOut: 0
    // };
    // if (!responseData) return empty;
    const empty = {
      totalMale: 0, totalFemale: 0, totalAdult: 0, totalChild: 0,
      totalLocal: 0, totalNonLocal: 0, totalCustomers: 0,
      avgTimePurchase: 0, avgTimeNotPurchase: 0, avgTimeCashOut: 0
    };
    if (!responseData) return empty;




    // if (responseData.type === 'summary') {
    //   const s = responseData.summary_stats;
    //   return {
    //     totalMale: s.total_male || 0,
    //     totalFemale: s.total_female || 0,
    //     totalAdult: s.total_adult || 0,
    //     totalChild: s.total_child || 0,
    //     totalLocal: s.total_local || 0,
    //     totalNonLocal: s.total_non_local || 0,
    //     totalCustomers: s.total_customers || 0,
    //     avgTimePurchase: s.avg_time_purchase || 0,
    //     avgTimeNotPurchase: s.avg_time_not_purchase || 0,
    //     avgTimeCashOut: s.avg_time_cash_out || 0
    //   }
    // }
    // if (responseData.type === 'raw') {
    //   return responseData.data.reduce((acc, item) => {
    //     const male = (item.male_adult || 0) + (item.male_child || 0);
    //     const female = (item.female_adult || 0) + (item.female_child || 0);
    //     acc.totalMale += male; acc.totalFemale += female;
    //     acc.totalAdult += (item.male_adult || 0) + (item.female_adult || 0);
    //     acc.totalChild += (item.male_child || 0) + (item.female_child || 0);
    //     acc.totalLocal += item.local_customers || 0; acc.totalNonLocal += item.non_local_customers || 0;
    //     acc.totalCustomers += (item.totalcount || 0);

    //     acc.avgTimePurchase = item.avg_time_purchase || acc.avgTimePurchase;
    //     acc.avgTimeNotPurchase = item.avg_time_not_purchase || acc.avgTimeNotPurchase;
    //     acc.avgTimeCashOut = item.avg_time_cash_out || acc.avgTimeCashOut;

    //     return acc;
    //   }, { ...empty });
    // }

    let result = { ...empty };

    if (responseData.type === 'summary') {
      const s = responseData.summary_stats;
      result = {
        totalMale: s.total_male || 0,
        totalFemale: s.total_female || 0,
        totalAdult: s.total_adult || 0,
        totalChild: s.total_child || 0,
        totalLocal: s.total_local || 0,
        totalNonLocal: s.total_non_local || 0,
        totalCustomers: s.total_customers || 0,
        avgTimePurchase: s.avg_time_purchase || 0,
        avgTimeNotPurchase: s.avg_time_not_purchase || 0,
        avgTimeCashOut: s.avg_time_cash_out || 0
      };
    } else if (responseData.type === 'raw') {
      result = responseData.data.reduce((acc, item) => {
        const male = (item.male_adult || 0) + (item.male_child || 0);
        const female = (item.female_adult || 0) + (item.female_child || 0);
        acc.totalMale += male; acc.totalFemale += female;
        acc.totalAdult += (item.male_adult || 0) + (item.female_adult || 0);
        acc.totalChild += (item.male_child || 0) + (item.female_child || 0);
        acc.totalLocal += item.local_customers || 0; acc.totalNonLocal += item.non_local_customers || 0;
        acc.totalCustomers += (item.totalcount || 0);

        acc.avgTimePurchase = item.avg_time_purchase || acc.avgTimePurchase;
        acc.avgTimeNotPurchase = item.avg_time_not_purchase || acc.avgTimeNotPurchase;
        acc.avgTimeCashOut = item.avg_time_cash_out || acc.avgTimeCashOut;

        return acc;
      }, { ...empty });




      
    }

  //   return empty;
  // }, [responseData]);
    const actualTotal = result.totalCustomers || 0;

    // 1. ضبط (الذكور والإناث)
    const currentGenderTotal = result.totalMale + result.totalFemale;
    // نأخذ نسبة الذكور الحالية (وإذا كانت صفر نفترض 50%)
    const maleRatio = currentGenderTotal > 0 ? (result.totalMale / currentGenderTotal) : 0.5;
    
    result.totalMale = Math.round(actualTotal * maleRatio);
    result.totalFemale = actualTotal - result.totalMale; // الباقي للإناث ليطابق المجموع الكلي

    // 2. ضبط (البالغين والأطفال)
    const currentAgeTotal = result.totalAdult + result.totalChild;
    // نأخذ نسبة البالغين الحالية (وإذا كانت صفر نفترض 70% كقيمة منطقية)
    const adultRatio = currentAgeTotal > 0 ? (result.totalAdult / currentAgeTotal) : 0.7;
    
    result.totalAdult = Math.round(actualTotal * adultRatio);
    result.totalChild = actualTotal - result.totalAdult; // الباقي للأطفال ليطابق المجموع الكلي

    // 👆 --- نهاية التعديل --- 👆

    return result;
  }, [responseData]);

   

  const trendData = useMemo(() => {
    if (dateMode !== 'range' || !responseData || responseData.type !== 'summary') return { labels: [], datasets: [] };
    const allDates = getDatesInRange(startDate, endDate);
    const map = new Map((responseData.daily_trend || []).map(item => [item.date, item.total_customers || 0]));
    return {
      labels: allDates,
      datasets: [{
        label: 'Total Customers Daily',
        data: allDates.map(d => map.get(d) || 0),
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        fill: true,
        tension: 0.4, // لجعل الخط منحني وعصري
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.primary.main,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  }, [responseData, dateMode, startDate, endDate, theme.palette.primary.main]);
  // src/components/Dashboard.js - تعديل جزء الـ return فقط

  return (<>

    <Box sx={{
      width: "100%",
      minHeight: '100vh',
      mx: 0,
      p: 1,
      marginTop: 0,
      backgroundSize: '400% 400%',
      animation: `${gradientAnimation} 15s ease infinite`,
    }}>
      <DashboardControls
        tempStoreId={tempStoreId} setTempStoreId={setTempStoreId}
        tempStartDate={tempStartDate} setTempStartDate={setTempStartDate}
        tempEndDate={tempEndDate} setTempEndDate={setTempEndDate}
        dateMode={dateMode} handleDateModeToggle={handleDateModeToggle}
        handleAnalyzeClick={handleAnalyzeClick} loading={loading}
        onGoToMachines={onGoToMachines} onGoToStatsReport={onGoToStatsReport}
        onGoToEmailSettings={onGoToEmailSettings}
        storesList={storesList}
      />

      {error && (
        <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.error.main, 0.08), borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
          <Typography color="error" align="center" fontWeight="bold">{error}</Typography>
        </Paper>
      )}

      {/* ✅ التحقق الآمن تماماً من عدم وجود بيانات */}
      {(() => {
        // حالة التحميل: لا نعرض أي شيء
        if (loading) return null;

        // حالة عدم وجود استجابة أو خطأ
        if (!responseData) return null;

        // التحقق من وجود بيانات فارغة (الحالة التي تريد معالجتها)
        const isEmptyData =
          (responseData.type === 'raw' && responseData.data && Array.isArray(responseData.data) && responseData.data.length === 0) ||
          (responseData.type === 'summary' && (!responseData.daily_trend || responseData.daily_trend.length === 0) && (!responseData.summary_stats || Object.keys(responseData.summary_stats).length === 0));

        if (isEmptyData) {
          return (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                mt: 4,
                textAlign: 'center',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.7)
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📭 No Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No records found for the selected criteria. Try changing the date range or store.
              </Typography>
            </Paper>
          );
        }

        // حالة وجود بيانات حقيقية: عرض المحتوى
        return (
          <Box container spacing={4} sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between" }}>
            {/* Main Chart */}
            <Grid item xs={12} lg={6} sx={{height: '100%', width:'48%'}}>
              <Box sx={{ height: '100%',width:'100%' }}>
                <MainChartPanel
                  dateMode={dateMode}
                  responseData={responseData}
                  startDate={startDate}
                  endDate={endDate}
                  trendData={trendData}
                  loading={loading}
                  storesList={storesList}
                />
              </Box>
            </Grid>

            {/* StatSummary */}
            <Grid item xs={12} lg={6}sx={{height: '100%', width:'50%'}}>
              <Box sx={{ height: '100%' }}>
                <StatSummary processedStats={processedStats} />
              </Box>
            </Grid>
          </Box>
        );
      })()}
    </Box>
  </>
  );



};

export default Dashboard;