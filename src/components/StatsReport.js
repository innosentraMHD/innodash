// src/components/StatsReport.js

import React, { useState, useMemo } from 'react';
import axiosInstance, { API } from '../api';
import { 
  Box, Typography, Button, Paper, Grid, TextField, Select, MenuItem, 
  FormControl, InputLabel, ToggleButton, ToggleButtonGroup, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert 
} from '@mui/material';
import { ArrowBack, Search, TableChart, CalendarViewDay, DateRange } from '@mui/icons-material';
const STORES_API_URL = API.STORES;
const API_URL = API.STATS;

function StatsReport({ onBackToDashboard }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('single');
  const [storeId, setStoreId] = useState('');
  const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

 const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setData([]); // تصفير البيانات
    
    const params = new URLSearchParams();
    
    // إعداد البارامترات كما هي
    if (storeId) params.append('store', storeId); // لاحظ: تأكد من اسم البارامتر في الباك اند (store أو store_id)
                                                 // في كود الباك اند الأخير استخدمنا 'store' في get_queryset
                                                 // لكن 'store_id' أيضاً يعمل في Django Filters عادة، سأفترض 'store' بناء على الكود السابق

    if (searchType === 'single') {
      if (singleDate) params.append('start', singleDate); // الباك اند يتوقع start ليوم واحد
      // لا نرسل end في حالة اليوم الواحد بناء على منطق الباك اند الجديد
    } else {
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
    }

    try {
      const response = await axiosInstance.get(API_URL, { params });
      
      // --- التعديل هنا ---
      // التحقق مما إذا كانت البيانات تأتي داخل خاصية data (الهيكل الجديد)
      let responseData = response.data;
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        responseData = responseData.data;
      } else if (!Array.isArray(responseData)) {
        responseData = responseData.results || responseData.records || [];
      }
      if (!Array.isArray(responseData)) {
        responseData = [];
      }
      setData(responseData);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const statistics = useMemo(() => {
    if (!data || data.length === 0) return null;
    const totalEnter = data.reduce((acc, item) => acc + item.enter_count, 0);
    const totalExit = data.reduce((acc, item) => acc + item.exit_count, 0);
    const totalPassBy = data.reduce((acc, item) => acc + item.pass_by_count, 0);
    const totalStand = data.reduce((acc, item) => acc + item.stand_count, 0);
    const totalAvgTimeSum = data.reduce((acc, item) => acc + item.avg_standing_time, 0);
    const avgStandingTime = totalAvgTimeSum / data.length;

    return { totalEnter, totalExit, totalPassBy, totalStand, avgStandingTime: avgStandingTime.toFixed(2), recordCount: data.length };
  }, [data]);



  const SummaryItem = ({ title, value, color = 'primary.main' }) => (
    <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid`, borderColor: color }}>
      <Typography variant="caption" color="textSecondary">{title}</Typography>
      <Typography variant="h5" fontWeight="bold">{value}</Typography>
    </Paper>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableChart /> Statistics Report
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBackToDashboard}>
          Back
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Store</InputLabel>
              
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={searchType}
              exclusive
              onChange={(e, val) => val && setSearchType(val)}
              fullWidth
              size="small"
            >
              <ToggleButton value="single"><CalendarViewDay sx={{ mr: 1 }} /> Single</ToggleButton>
              <ToggleButton value="range"><DateRange sx={{ mr: 1 }} /> Range</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          {searchType === 'single' ? (
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" type="date" label="Date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          ) : (
            <>
              <Grid item xs={6} md={2}>
                <TextField fullWidth size="small" type="date" label="Start" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField fullWidth size="small" type="date" label="End" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={handleSearch} disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {statistics && (
        <Box mb={4}>
           <Typography variant="h6" gutterBottom>Period Summary</Typography>
           <Grid container spacing={2}>
             <Grid item xs={6} md={2}><SummaryItem title="Total Enter" value={statistics.totalEnter} color="success.main" /></Grid>
             <Grid item xs={6} md={2}><SummaryItem title="Total Exit" value={statistics.totalExit} color="success.main" /></Grid>
             <Grid item xs={6} md={2}><SummaryItem title="Total Pass-by" value={statistics.totalPassBy} /></Grid>
             <Grid item xs={6} md={2}><SummaryItem title="Total Stand" value={statistics.totalStand} /></Grid>
             <Grid item xs={12} md={4}><SummaryItem title="Avg. Standing Time (s)" value={statistics.avgStandingTime} color="warning.main" /></Grid>
           </Grid>
        </Box>
      )}

      {data.length > 0 && (
        <Paper>
          <Box p={2} borderBottom={1} borderColor="divider">
             <Typography variant="h6">Raw Data ({statistics.recordCount} records)</Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Store</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Enter</TableCell>
                  <TableCell>Exit</TableCell>
                  <TableCell>Pass-by</TableCell>
                  <TableCell>Stand</TableCell>
                  <TableCell>Avg. Time (s)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(data) && data.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.store_name}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.enter_count}</TableCell>
                    <TableCell>{item.exit_count}</TableCell>
                    <TableCell>{item.pass_by_count}</TableCell>
                    <TableCell>{item.stand_count}</TableCell>
                    <TableCell>{item.avg_standing_time.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {!loading && !error && data.length === 0 && statistics === null && (
        <Box textAlign="center" py={5} color="text.secondary">
           <Typography>No data found. Try adjusting the search filters.</Typography>
        </Box>
      )}
    </Box>
  );
}

export default StatsReport;