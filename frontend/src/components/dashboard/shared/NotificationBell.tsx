import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import NotificationsModal from './NotificationsModal';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, deleteNotificationById } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotificationById(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  );
};

export default NotificationBell;
