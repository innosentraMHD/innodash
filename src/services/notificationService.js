import axios from 'axios';
import { BASE_URL } from '../api'; 

const API_BASE_URL = BASE_URL.endsWith('/') 
  ? `${BASE_URL}notifications` 
  : `${BASE_URL}/notifications`;

const notificationService = {
  getNotifications: async (page = 1, authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/?page=${page}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      return response.data; 
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getUnreadCount: async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread_count/`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  getNotificationsByStore: async (storeId, page = 1, authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/by_store/?store_id=${storeId}&page=${page}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by store:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId, authToken) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/${notificationId}/mark_read/`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (authToken) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/mark_all_read/`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId, authToken) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}/`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

export default notificationService;