import React, { useState, useEffect, useRef } from 'react';
import {
  Paper, Typography, Box, Grid, FormControl, Select, MenuItem,
  Stack, Divider, CircularProgress, Button, IconButton, Alert, useTheme
} from '@mui/material';
import { 
  Map as MapIcon, 
  CloudUpload, 
  Delete, 
  Edit, 
  ImageNotSupported 
} from '@mui/icons-material';

// افترض أنك أضفت STORE_MAP للـ API constants
// API.STORE_MAP = '/store-map/manage/'
import axiosInstance, { API } from '../api'; 

const StoreMapPage = () => {
  const theme = useTheme();
  // --- States ---
  const [storesList, setStoresList] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  
  // Map Image States
  const [mapData, setMapData] = useState(null); // يحوي رابط الصورة وبياناتها
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Hidden File Input Ref
  const fileInputRef = useRef(null);

  // 1. جلب قائمة المتاجر


  useEffect(() => {
  const fetchStores = async () => {
    try {
      const res = await axiosInstance.get(API.STORES);
      
      // If your API returns { data: [...] }
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      
      setStoresList(data);
      
      if (data.length > 0) {
        setSelectedStoreId(data[0].id);
      }
    } catch (err) { 
      console.error("Fetch stores error:", err); 
      setStoresList([]); // Fallback to empty array on error
    }
  };
  fetchStores();
}, []);

  // 2. جلب خريطة المتجر عند اختيار متجر
  useEffect(() => {
    if (!selectedStoreId) return;
    fetchMapImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId]);

  const fetchMapImage = async () => {
    setLoading(true);
    setError(null);
    setMapData(null);
    try {
      const res = await axiosInstance.get(API.STORE_MAP, {
        params: { store_id: selectedStoreId }
      });
      // الـ View يعيد كائن يحوي image url
      setMapData(res.data); 
    } catch (err) {
      // 404 تعني لا توجد خريطة، هذا ليس خطأ تقني بل حالة طبيعية
      if (err.response && err.response.status === 404) {
        setMapData(null); 
      } else {
        console.error("Error fetching map:", err);
        setError("Failed to load map info");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. دالة رفع الصورة (أو تعديلها)
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('store_id', selectedStoreId);
    formData.append('image', file);

    setUploading(true);
    try {
      // نستخدم POST للإنشاء أو التعديل كما برمجنا الـ View
      const res = await axiosInstance.post(API.STORE_MAP, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMapData(res.data); // تحديث الصورة المعروضة
    } catch (err) {
      console.error("Error uploading map:", err);
      setError("Failed to upload map");
    } finally {
      setUploading(false);
      // تصفير الـ input للسماح برفع نفس الملف مجدداً إذا لزم
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 4. دالة حذف الصورة
  const handleDeleteMap = async () => {
    if(!window.confirm("Are you sure you want to delete this store map?")) return;

    setUploading(true);
    try {
      await axiosInstance.delete(API.STORE_MAP, {
        params: { store_id: selectedStoreId }
      });
      setMapData(null); // إزالة الصورة من العرض
    } catch (err) {
      console.error("Error deleting map:", err);
      setError("Failed to delete map");
    } finally {
      setUploading(false);
    }
  };

const currentStore = Array.isArray(storesList) 
  ? storesList.find(s => s.id === selectedStoreId) || {} 
  : {};

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', p: 1 }}>
      
      <Box mb={2}>
        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapIcon /> Store Floor Map
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        
        {/* Sidebar: Selection & Actions */}
        <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Store Selector */}
          <Paper elevation={0} sx={{ p: 2, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">STORE SELECTION</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <Select 
  value={selectedStoreId} 
  onChange={(e) => setSelectedStoreId(e.target.value)} 
  displayEmpty
>
  {/* استخدام الاختصار (storesList || []) يضمن أنه حتى لو كانت القيمة null لن ينهار التطبيق */}
  {(Array.isArray(storesList) ? storesList : []).map((store) => (
    <MenuItem key={store.id} value={store.id}>
      {store.store_name || `Store #${store.id}`}
    </MenuItem>
  ))}
</Select>
            </FormControl>
          </Paper>

          {/* Actions Panel */}
          <Paper elevation={0} sx={{ p: 2, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
             <Typography variant="caption" fontWeight="bold" color="text.secondary">ACTIONS</Typography>
             <Stack spacing={2} mt={2}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {/* زر الرفع يظهر دائماً، لكن يتغير نصه إذا كانت هناك صورة */}
                <Button 
                  variant="contained" 
                  startIcon={mapData ? <Edit /> : <CloudUpload />}
                  onClick={() => fileInputRef.current.click()}
                  disabled={!selectedStoreId || uploading}
                  fullWidth
                >
                  {mapData ? "Change Map Image" : "Upload Map Image"}
                </Button>

                {/* زر الحذف يظهر فقط إذا كانت هناك صورة */}
                {mapData && (
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteMap}
                    disabled={uploading}
                    fullWidth
                  >
                    Delete Map
                  </Button>
                )}
             </Stack>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}
        </Grid>

        {/* Main Image Display */}
        <Grid item xs={12} md={9} sx={{ height: '100%' }}>
          <Paper elevation={0} sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <Box mb={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {currentStore?.name || 'Map Preview'}
                </Typography>
                {mapData && (
                   <Typography variant="caption" color="text.secondary">
                     Last Updated: {new Date(mapData.updated_at).toLocaleDateString()}
                   </Typography>
                )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ 
                flex: 1, 
                bgcolor: theme.palette.custom.mapPreviewBackground, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden', 
                position: 'relative',
                border: `1px dashed ${theme.palette.custom.dashedBorder}`
            }}>
              
              {(loading || uploading) && <CircularProgress sx={{ position: 'absolute' }} />}
              
              {!loading && !uploading && (
                <>
                  {mapData?.image ? (
                    <img 
                        src={mapData.image} // Django returns the full URL usually
                        alt="Store Map" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain' 
                        }} 
                    />
                  ) : (
                    <Stack alignItems="center" color="text.secondary" spacing={1}>
                        <ImageNotSupported fontSize="large" sx={{ fontSize: 60, opacity: 0.5 }} />
                        <Typography>No map uploaded for this store yet</Typography>
                        <Button size="small" onClick={() => fileInputRef.current.click()}>Upload Now</Button>
                    </Stack>
                  )}
                </>
              )}

            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StoreMapPage;