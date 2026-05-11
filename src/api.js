import axios from 'axios';

// تأكد أن هذا الرابط يطابق رابط السيرفر الخاص بك (Django)
//  "https://MHDinnosentra.pythonanywhere.com";
// "https://amari-uncondemning-completively.ngrok-free.dev";

export const BASE_URL = "https://MHDinnosentra.pythonanywhere.com";

// export const BASE_URL = "http://127.0.0.1:8000/";




export const API = {
  // Auth & Accounts
  LOGIN: `${BASE_URL}/accounts/login/`,
  REFRESH: `${BASE_URL}/accounts/token/refresh/`,
  SETUP: `${BASE_URL}/accounts/setup-admin/`,
  INVITE: `${BASE_URL}/accounts/invite/`,
  REGISTER: `${BASE_URL}/accounts/register/`,
  USERS: `${BASE_URL}/accounts/users/`,
  CHECK_INIT: `${BASE_URL}/accounts/check-init/`,

  // Core App
  STATS: `${BASE_URL}/api/stats/`,
  DEVICES: `${BASE_URL}/sub_edges`, 
  EMAIL_CONFIG: `${BASE_URL}/configuration`,
  DASHBOARD: `${BASE_URL}/api/stats/demographics/raw/`,
  STORES: `${BASE_URL}/sub_edges/stores/`,
  
  // --- التعديل هنا ---
  // نستخدم هذا الرابط لجلب الهت ماب (GET) ولرفعها (POST)
  HEATMAP: `${BASE_URL}/api/heatmap/sync/`, 
  // -------------------

  STORE_MAP: `${BASE_URL}/api/store-map/manage/`,
};

// إنشاء نسخة مخصصة من Axios
const axiosInstance = axios.create({
    baseURL: BASE_URL, // إضافة baseURL هنا ممارسة جيدة جداً لتجنب مشاكل المسارات
});

// 1. Request Interceptor: إضافة التوكن لكل طلب
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: التعامل مع انتهاء صلاحية التوكن
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
           const res = await axios.post(API.REFRESH, { refresh: refreshToken });
           localStorage.setItem('access_token', res.data.access);
           
           // تحديث الهيدر في الطلب الأصلي وإعادة إرساله
           originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
           
           // ملاحظة: نستخدم axiosInstance هنا لضمان استخدام الإعدادات الصحيحة
           return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.log("Session expired");
        localStorage.clear();
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;





