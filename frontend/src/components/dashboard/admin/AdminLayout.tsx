import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboardPage from './pages/DashboardPage';
import AdminBookingsPage from './pages/BookingsPage';
import AdminEnrolledStudentsPage from './pages/EnrolledStudentsPage';
import AdminMentorsPage from './pages/MentorsPage';

// Additional admin components (you can create these later)
const AdminReports = () => <div className="p-6">Admin Reports Component</div>;
const AdminAnalytics = () => <div className="p-6">Admin Analytics Component</div>;
const AdminPayments = () => <div className="p-6">Admin Payments Component</div>;
const AdminNotifications = () => <div className="p-6">Admin Notifications Component</div>;
const AdminSettings = () => <div className="p-6">Admin Settings Component</div>;

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard/overview" replace />} />
            <Route path="/overview" element={<AdminDashboardPage />} />
            <Route path="/bookings" element={<AdminBookingsPage />} />
            <Route path="/students" element={<AdminEnrolledStudentsPage />} />
            <Route path="/mentors" element={<AdminMentorsPage />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

