import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboardPage />;
      case 'bookings':
        return <AdminBookingsPage />;
      case 'students':
        return <AdminEnrolledStudentsPage />;
      case 'mentors':
        return <AdminMentorsPage />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'reports':
        return <AdminReports />;
      case 'payments':
        return <AdminPayments />;
      case 'notifications':
        return <AdminNotifications />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

