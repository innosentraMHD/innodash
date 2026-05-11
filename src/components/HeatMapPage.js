
import React, { useState, useEffect, useRef } from 'react';
import {
  Paper, Typography, Box, Grid, FormControl, Select, MenuItem,
  Stack, Divider, CircularProgress, Button, Alert, TextField, useTheme,
  Slider, FormControlLabel, Switch // إضافة Switch
} from '@mui/material';
import { 
  Map as MapIcon, 
  CloudUpload, 
  Delete, 
  Edit, 
  Layers, 
  Opacity,
  DateRange // أيقونة جديدة للمجال
} from '@mui/icons-material';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import axiosInstance, { API } from '../api'; 

const HeatMapPage = () => {
  const theme = useTheme();
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  const [storesList, setStoresList] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // --- Heatmap States ---
  const [isRangeMode, setIsRangeMode] = useState(false); // حالة لتحديد وضع المجال
  const [heatmapDate, setHeatmapDate] = useState(getTodayDate()); // ليوم واحد
  const [startDate, setStartDate] = useState(''); // بداية المجال
  const [endDate, setEndDate] = useState('');     // نهاية المجال
  const [heatmapImageSrc, setHeatmapImageSrc] = useState(null);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);
  const [heatmapOpacity, setHeatmapOpacity] = useState(50); 

  const fileInputRef = useRef(null);

  // ... (نفس دالة useEffect لجلب المتاجر) ...
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axiosInstance.get(API.STORES);
        setStoresList(res.data);
        if (res.data && res.data.length > 0) setSelectedStoreId(res.data[0].id);
      } catch (err) { console.error(err); }
    };
    fetchStores();
    
  }, []);

  useEffect(() => {
    if (selectedStoreId) handleFetchHeatmap();
  }, [selectedStoreId]);
  
  // ... (نفس دالة useEffect عند تغيير المتجر) ...
  useEffect(() => {
    if (!selectedStoreId) return;

    fetchMapImage();
    setHeatmapImageSrc(null);
    
    setStartDate('');
    setEndDate('');
  }, [selectedStoreId]);

  const downloadAndCacheImage = async (serverData, storageKey, storeId) => {
    try {
        // 1. تحميل الصورة كـ Blob
        const response = await fetch(serverData.image);
        const blob = await response.blob();
        
        // 2. تحويل الـ Blob إلى Base64 للحفظ
        const base64Data = await convertBlobToBase64(blob);

        // 3. حفظ الملف في نظام ملفات الهاتف
        await Filesystem.writeFile({
            path: `maps/store_${storeId}.png`,
            data: base64Data,
            directory: Directory.Data,
            recursive: true
        });

        // 4. تحديث الـ Metadata في localStorage وتخزين updated_at
        localStorage.setItem(storageKey, JSON.stringify({
            updatedAt: serverData.updated_at, // نعتمد هنا على تاريخ التحديث
            localPath: `maps/store_${storeId}.png`
        }));

        setMapData({ ...serverData, image: serverData.image });
    } catch (e) {
        console.error("Caching failed", e);
        setMapData(serverData); // عرض الصورة من الرابط مباشرة كخطة بديلة في حال فشل الحفظ
    }
};

const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(blob);
});

  const fetchMapImage = async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await axiosInstance.get(API.STORE_MAP, {
            params: { store_id: selectedStoreId }
        });
        
        const serverMapData = res.data; // يحتوي على image (الرابط) و updated_at
        const storageKey = `map_metadata_${selectedStoreId}`;
        const cachedMeta = JSON.parse(localStorage.getItem(storageKey));

        // التحقق هل نحن في بيئة موبايل (Capacitor)؟
        const isPushToMobile = Capacitor.isNativePlatform();

        // التعديل الجوهري هنا: نتحقق من تطابق updated_at
        if (isPushToMobile && cachedMeta && cachedMeta.updatedAt === serverMapData.updated_at) {
            // الفلسفة: تاريخ التعديل متطابق -> الصورة لم تتغير، اقرأها من ذاكرة الهاتف
            try {
                const readFile = await Filesystem.readFile({
                    path: `maps/store_${selectedStoreId}.png`,
                    directory: Directory.Data
                });
                // تحويلها لـ Base64 للعرض
                setMapData({ ...serverMapData, image: `data:image/png;base64,${readFile.data}` });
            } catch (e) {
                // إذا فشل القراءة (الملف حُذف مثلاً)، حملها مجدداً
                downloadAndCacheImage(serverMapData, storageKey, selectedStoreId);
            }
        } else if (isPushToMobile) {
            // الفلسفة: تاريخ التعديل مختلف أو لا يوجد بيانات -> حمل الصورة واحفظها
            downloadAndCacheImage(serverMapData, storageKey, selectedStoreId);
        } else {
            // بيئة ويب عادية - المتصفح يتكفل بالـ Caching التلقائي
            setMapData(serverMapData);
        }

    } catch (err) {
        if (err.response && err.response.status === 404) {
            setMapData(null);
        } else {
            setError("Failed to load map info");
        }
    } finally {
        setLoading(false);
    }
};

  // === التعديل هنا: دالة جلب الهت ماب ===
  const handleFetchHeatmap = async () => {
    // التحقق من المدخلات بناءً على الوضع
    if (!selectedStoreId) return;
    
    let params = { store_id: selectedStoreId };

    if (isRangeMode) {
        if (!startDate || !endDate) {
            setHeatmapError("Please select both start and end dates.");
            return;
        }
        params.start_date = startDate;
        params.end_date = endDate;
    } else {
        if (!heatmapDate) {
            setHeatmapError("Please select a date first.");
            return;
        }
        params.date = heatmapDate;
    }

    setLoadingHeatmap(true);
    setHeatmapError(null);
    
    try {
        const res = await axiosInstance.get(API.HEATMAP, { 
            params: params, // نرسل البارامترات الديناميكية
            responseType: 'blob' 
        });
        const imageUrl = URL.createObjectURL(res.data);
        setHeatmapImageSrc(imageUrl);
    } catch (err) {
        setHeatmapError(isRangeMode ? "No data found for this range." : "No data found for this date.");
    } finally {
        setLoadingHeatmap(false);
    }
  };

  // ... (نفس دوال handleFileChange و handleDeleteMap) ...
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('store_id', selectedStoreId);
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await axiosInstance.post(API.STORE_MAP, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMapData(res.data);
    } catch (err) {
      setError("Failed to upload map");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMap = async () => {
    if(!window.confirm("Are you sure?")) return;
    setUploading(true);
    try {
      await axiosInstance.delete(API.STORE_MAP, { params: { store_id: selectedStoreId } });
      setMapData(null);
      setHeatmapImageSrc(null);
    } catch (err) {
      setError("Failed to delete map");
    } finally {
      setUploading(false);
    }
  };

  const currentStore = storesList.find(s => s.id === selectedStoreId) || {};

  return (
    <Box 
      sx={{ 
        height: '90vh', 
        display: 'flex', 
        alignItems: 'center', // Centering the 80% height container vertically
        justifyContent: 'center',
   // Optional background color
    
        pt:0 
      }}
    >
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: '1400px', // Optional: keeps the layout from getting too wide on ultra-wide screens
          height: '80vh',      // Forces the height to be 80% of the viewport height
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2
        }}
      >
        {/* 1. Main Image Display - 50% Width on Laptop */}
        <Box 
          sx={{ 
            flex: { xs: '1 1 auto', md: '0 0 50%' }, // Takes exactly 50% width on md+ screens
            height: '100%', 
            minHeight: 0 
          }}
        >
          <Paper sx={{ height: '100%', p: 0, display: 'flex', flexDirection: 'column' }}>
            <Box mb={1} sx={{m: 1,ml:2}} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="primary" fontWeight="bold">
                {currentStore?.store_name || 'Map Preview'}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ 
                flex: 1, 
                borderRadius: 2, 
                display: 'flex',             
                alignItems: 'center',        
                justifyContent: 'center',    
                overflow: 'hidden', 
                position: 'relative',
                // border: `1px dashed ${theme.palette.custom.dashedBorder}`,
                
                p: 0
            }}>
              {(loading || uploading) && <CircularProgress />}
              
              {!loading && !uploading && mapData?.image && (
                <Box sx={{   position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                        src={mapData.image} 
                        alt="Store Map" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }} 
                    />
  
                    {heatmapImageSrc && (
                        <img 
                            src={heatmapImageSrc} 
                            alt="Heatmap Overlay" 
                            style={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain', // Match this to base image objectFit
                                opacity: heatmapOpacity / 100,
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s ease'
                            }} 
                        />
                    )}
                </Box>
              )}
              {!loading && !uploading && !mapData?.image && (
                 <Typography color="text.secondary">No map uploaded</Typography>
              )}
            </Box>
          </Paper>
        </Box>
  
        {/* 2. Controls - 50% Width on Laptop (Stacked as Column) */}
        <Box 
          sx={{ 
            flex: { xs: '1 1 auto', md: '0 0 50%' }, // Takes the other 50% width
            height: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            overflowY: 'auto', // Allows scrolling if controls exceed height
            p: 1
          // Padding for scrollbar
          }}
        >
          {/* Store Selection */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">STORE SELECTION</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <Select value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)}>
                {storesList.map((store) => (
                    <MenuItem key={store.id} value={store.id}>{store.store_name || `Store #${store.id}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
  
          {/* Heatmap Controls */}
          <Paper sx={{ p: 2, flexGrow: 1 }}>
             <FormControlLabel 
                control={
                    <Switch 
                        checked={isRangeMode} 
                        onChange={(e) => setIsRangeMode(e.target.checked)} 
                        size="medium" 
                    />
                }
                label={
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, ml:2 }}>
                        {isRangeMode ? <DateRange fontSize="small"/> : <Layers fontSize="small"/>}
                        {isRangeMode ? "Date Range Mode" : "Single Date Mode"}
                    </Typography>
                }
                sx={{ mb: 2 }}
             />
  
             <Stack spacing={2}>
                {!isRangeMode ? (
                    <TextField
                        type="date"
                        size="small"
                        fullWidth
                        value={heatmapDate}
                        onChange={(e) => setHeatmapDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        label="Select Date"
                    />
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            type="date"
                            size="small"
                            fullWidth
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            label="From"
                        />
                        <TextField
                            type="date"
                            size="small"
                            fullWidth
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            label="To"
                        />
                    </Box>
                )}
                
                <Box sx={{ px: 1 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Opacity fontSize="small" /> Opacity: {heatmapOpacity}%
                  </Typography>
                  <Slider
                    value={heatmapOpacity}
                    onChange={(e, newValue) => setHeatmapOpacity(newValue)}
                    min={0}
                    max={100}
                    disabled={!heatmapImageSrc}
                  />
                </Box>
  
                <Button 

                    sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark, }}
                    variant="contained" 
                    color="info"
                    startIcon={loadingHeatmap ? <CircularProgress size={20} color="inherit"/> : (isRangeMode ? <DateRange /> : <Layers />)}
                    onClick={handleFetchHeatmap}
                    disabled={!mapData || !selectedStoreId || loadingHeatmap}
                    fullWidth
                   
                >
                    {loadingHeatmap ? "Generating..." : (isRangeMode ? "Show Range Heatmap" : "Show Daily Heatmap")}
                </Button>
                {heatmapError && <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>{heatmapError}</Alert>}
             </Stack>
          </Paper>
  
          {/* Map Actions */}
          <Paper sx={{ p: 2 }}>
             <Stack spacing={2}>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <Button 
                  variant="outlined" 
                  startIcon={mapData ? <Edit /> : <CloudUpload />} 
                  onClick={() => fileInputRef.current.click()}
                  disabled={!selectedStoreId || uploading}
                  fullWidth
                >
                  {mapData ? "Change Map" : "Upload Map"}
                </Button>
                {mapData && (
                  <Button variant="text" sx={{color:theme.palette.primary.contrastText,backgroundColor:theme.palette.chartLegacy.error}} startIcon={<Delete />} onClick={handleDeleteMap} fullWidth>
                    Remove Map
                  </Button>
                )}
             </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HeatMapPage;

