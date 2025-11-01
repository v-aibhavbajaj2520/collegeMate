import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

export interface NotificationResponse {
  success: boolean;
  notification?: Notification;
  message?: string;
}

// Get all notifications for the authenticated user
export const fetchNotifications = async (token: string): Promise<NotificationsResponse> => {
  try {
    const response = await api.get<NotificationsResponse>('/api/notifications');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token error - will be handled by api interceptor
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string, token: string): Promise<NotificationResponse> => {
  try {
    const response = await api.patch<NotificationResponse>(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string, token: string): Promise<NotificationResponse> => {
  try {
    const response = await api.delete<NotificationResponse>(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete notification');
  }
};
